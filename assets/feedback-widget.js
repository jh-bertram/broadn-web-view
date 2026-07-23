/* =====================================================================
   BROADN Feedback Widget
   Self-contained IIFE — no import/export/require, no external dependencies.
   All user-supplied text is rendered via .textContent (never innerHTML).
   Fetch uses Content-Type: text/plain;charset=utf-8 (GAS CORS requirement).
   timestamp is NOT included in client payload — server generates it.
   ===================================================================== */
(function () {
  'use strict';

  /* ---- 1. Config read ---- */
  var FEEDBACK_URL = (typeof window.BROADN_FEEDBACK_URL === 'string')
    ? window.BROADN_FEEDBACK_URL.trim()
    : '';
  var IS_CONFIGURED = FEEDBACK_URL.length > 0;

  /* ---- Module-level state ---- */
  var popoverEl = null;         // singleton popover element (created lazily)
  var backdropEl = null;        // mobile backdrop (created lazily)
  var currentTrigger = null;    // the button that opened the current popover
  var autoCloseTimer = null;    // setTimeout reference for success auto-close

  /* ---- SVG icon strings (inline — no CDN) ---- */
  var SVG_BUBBLE = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  var SVG_CLOSE = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true" focusable="false"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  var SVG_SPINNER = '<svg class="fb-spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="60" stroke-dashoffset="45" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/></svg>';

  var SVG_CHECK = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="color:#0e7474;display:block;margin:0 auto;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';

  var SVG_LOCK = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="color:#a8a29e;display:block;margin:0 auto;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';


  /* ---- 2. Popover creation ---- */
  function createPopover() {
    var el = document.createElement('div');
    el.id = 'fb-popover';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'fb-popover-title');
    document.body.appendChild(el);
    return el;
  }

  function createBackdrop() {
    var el = document.createElement('div');
    el.id = 'fb-backdrop';
    document.body.appendChild(el);
    el.addEventListener('mousedown', function (e) {
      e.preventDefault();
      closePopover();
    });
    return el;
  }

  /* Build the popover's inner HTML for a given trigger context.
     SECURITY: element label is set via textContent after building the shell. */
  function buildPopoverContent(label) {
    popoverEl.innerHTML = '';

    /* -- Header -- */
    var header = document.createElement('div');
    header.className = 'fb-popover-header';

    var titleSpan = document.createElement('span');
    titleSpan.id = 'fb-popover-title';
    titleSpan.className = 'fb-popover-title';
    titleSpan.textContent = label;            /* textContent — safe */
    header.appendChild(titleSpan);

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.id = 'fb-close-btn';
    closeBtn.className = 'fb-close-btn';
    closeBtn.setAttribute('aria-label', 'Close feedback form');
    closeBtn.innerHTML = SVG_CLOSE;          /* static SVG — not user data */
    closeBtn.addEventListener('click', closePopover);
    header.appendChild(closeBtn);
    popoverEl.appendChild(header);

    /* -- Body -- */
    var body = document.createElement('div');
    body.id = 'fb-popover-body';

    if (!IS_CONFIGURED) {
      /* Not-configured state */
      var notCfg = document.createElement('div');
      notCfg.className = 'fb-not-configured';
      notCfg.id = 'fb-not-configured-msg';
      notCfg.setAttribute('role', 'note');
      notCfg.innerHTML = SVG_LOCK;           /* static SVG */
      var notCfgText = document.createElement('p');
      notCfgText.className = 'fb-not-configured-text';
      notCfgText.textContent = 'Feedback system not yet configured.';
      var notCfgSub = document.createElement('p');
      notCfgSub.className = 'fb-not-configured-text';
      notCfgSub.textContent = 'Contact the dashboard maintainer.';
      notCfg.appendChild(notCfgText);
      notCfg.appendChild(notCfgSub);
      body.appendChild(notCfg);
    } else {
      /* Configured state: full form */

      /* sr-only label for textarea */
      var textareaLabel = document.createElement('label');
      textareaLabel.htmlFor = 'fb-textarea';
      textareaLabel.className = 'fb-sr-only';
      textareaLabel.textContent = 'Your feedback';
      body.appendChild(textareaLabel);

      /* Textarea */
      var textarea = document.createElement('textarea');
      textarea.id = 'fb-textarea';
      textarea.className = 'fb-textarea';
      textarea.rows = 4;
      textarea.placeholder = 'What would make this section more useful to your research?';
      textarea.setAttribute('aria-required', 'true');
      textarea.setAttribute('aria-describedby', 'fb-textarea-error');

      /* Update submit button state on each keystroke */
      textarea.addEventListener('input', function () {
        updateSubmitState();
        /* Clear field error on typing */
        var errEl = document.getElementById('fb-textarea-error');
        if (errEl) {
          errEl.classList.remove('fb-field-error--visible');
          textarea.classList.remove('fb-textarea--error');
          textarea.removeAttribute('aria-invalid');
        }
      });
      body.appendChild(textarea);

      /* Inline textarea validation error */
      var fieldErr = document.createElement('p');
      fieldErr.id = 'fb-textarea-error';
      fieldErr.className = 'fb-field-error';
      fieldErr.setAttribute('role', 'alert');
      fieldErr.textContent = 'Please enter feedback before submitting.';
      body.appendChild(fieldErr);

      /* Identity toggle */
      var identityToggle = document.createElement('button');
      identityToggle.type = 'button';
      identityToggle.id = 'fb-identity-toggle';
      identityToggle.className = 'fb-identity-toggle';
      identityToggle.setAttribute('aria-expanded', 'false');
      identityToggle.setAttribute('aria-controls', 'fb-identity-fields');
      identityToggle.textContent = 'Identify yourself (optional)';
      body.appendChild(identityToggle);

      /* Identity fields panel */
      var identityPanel = document.createElement('div');
      identityPanel.id = 'fb-identity-fields';

      var nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.id = 'fb-name';
      nameInput.className = 'fb-input';
      nameInput.placeholder = 'Your name';
      nameInput.setAttribute('autocomplete', 'name');

      var emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.id = 'fb-email';
      emailInput.className = 'fb-input';
      emailInput.placeholder = 'your@email.edu';
      emailInput.setAttribute('autocomplete', 'email');

      identityPanel.appendChild(nameInput);
      identityPanel.appendChild(emailInput);
      body.appendChild(identityPanel);

      /* Identity toggle handler */
      identityToggle.addEventListener('click', function () {
        var isExpanded = identityToggle.getAttribute('aria-expanded') === 'true';
        identityToggle.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        if (isExpanded) {
          identityPanel.classList.remove('fb-visible');
        } else {
          identityPanel.classList.add('fb-visible');
        }
      });

      /* Submit button */
      var submitBtn = document.createElement('button');
      submitBtn.type = 'button';
      submitBtn.id = 'fb-submit';
      submitBtn.className = 'fb-submit';
      submitBtn.setAttribute('aria-disabled', 'true');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submit feedback';
      body.appendChild(submitBtn);

      /* Submit error message */
      var submitErr = document.createElement('p');
      submitErr.id = 'fb-error-msg';
      submitErr.className = 'fb-submit-error';
      submitErr.setAttribute('role', 'alert');
      body.appendChild(submitErr);

      /* Wire submit */
      submitBtn.addEventListener('click', handleSubmit);
    }

    popoverEl.appendChild(body);
  }

  /* Enable / disable submit button based on textarea content */
  function updateSubmitState() {
    var textarea = document.getElementById('fb-textarea');
    var submitBtn = document.getElementById('fb-submit');
    if (!textarea || !submitBtn) { return; }
    var hasContent = textarea.value.trim().length > 0;
    submitBtn.disabled = !hasContent;
    submitBtn.setAttribute('aria-disabled', hasContent ? 'false' : 'true');
  }


  /* ---- 3. Open / close popover ---- */
  function openPopover(triggerBtn, targetId, targetLabel) {
    if (!popoverEl) { popoverEl = createPopover(); }
    if (!backdropEl) { backdropEl = createBackdrop(); }

    /* Clear any pending auto-close */
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }

    /* Clear open state from previous trigger */
    if (currentTrigger && currentTrigger !== triggerBtn) {
      currentTrigger.classList.remove('fb-icon--open');
      currentTrigger.setAttribute('aria-expanded', 'false');
    }

    currentTrigger = triggerBtn;
    if (currentTrigger) {
      currentTrigger.classList.add('fb-icon--open');
      currentTrigger.setAttribute('aria-expanded', 'true');
    }

    buildPopoverContent(targetLabel);
    popoverEl.setAttribute('aria-describedby', IS_CONFIGURED ? 'fb-textarea' : 'fb-not-configured-msg');

    positionPopover(triggerBtn);

    /* Unhide and animate */
    popoverEl.classList.remove('fb-popover--closing');
    popoverEl.classList.add('fb-popover--open');

    /* Show backdrop on mobile */
    if (window.innerWidth < 768) {
      backdropEl.classList.add('fb-visible');
    }

    /* Move focus */
    if (IS_CONFIGURED) {
      var textarea = document.getElementById('fb-textarea');
      if (textarea) { textarea.focus(); }
    } else {
      var closeBtn = document.getElementById('fb-close-btn');
      if (closeBtn) { closeBtn.focus(); }
    }
  }

  function closePopover() {
    if (!popoverEl) { return; }

    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }

    popoverEl.classList.remove('fb-popover--open');
    popoverEl.classList.add('fb-popover--closing');

    if (backdropEl) {
      backdropEl.classList.remove('fb-visible');
    }

    /* Restore open state on trigger */
    if (currentTrigger) {
      currentTrigger.classList.remove('fb-icon--open');
      currentTrigger.setAttribute('aria-expanded', 'false');
      currentTrigger.focus();
    }

    /* After transition ends, fully hide */
    var dur = window.innerWidth < 768 ? 150 : 100;
    setTimeout(function () {
      popoverEl.classList.remove('fb-popover--closing');
    }, dur);

    currentTrigger = null;
  }

  /* Viewport-aware positioning. Preferred: below-right of trigger.
     Flips left if right edge clips. Flips above if bottom clips.
     For the floating button (triggerBtn is the floating btn element),
     open above-left. For null triggerBtn, opens above-left of viewport corner. */
  function positionPopover(triggerBtn) {
    var POPOVER_W = 320;
    var GAP = 4;

    if (window.innerWidth < 768) {
      /* Mobile: CSS handles fixed-bottom positioning */
      popoverEl.style.cssText = '';
      return;
    }

    if (!triggerBtn) {
      /* Fallback: bottom-right corner of viewport */
      popoverEl.style.position = 'fixed';
      popoverEl.style.bottom = '80px';
      popoverEl.style.right = '24px';
      popoverEl.style.top = 'auto';
      popoverEl.style.left = 'auto';
      return;
    }

    var rect = triggerBtn.getBoundingClientRect();
    var vpW = window.innerWidth;
    var vpH = window.innerHeight;

    /* Floating button: open above-left */
    if (triggerBtn.id === 'fb-floating-btn') {
      popoverEl.style.position = 'fixed';
      popoverEl.style.bottom = (vpH - rect.top + GAP) + 'px';
      popoverEl.style.right = (vpW - rect.right) + 'px';
      popoverEl.style.top = 'auto';
      popoverEl.style.left = 'auto';
      return;
    }

    /* In-page triggers: absolute within document. Use pageX offsets. */
    popoverEl.style.position = 'absolute';
    popoverEl.style.bottom = 'auto';

    var triggerPageTop = rect.top + window.scrollY;
    var triggerPageLeft = rect.left + window.scrollX;

    /* Preferred: below trigger */
    var preferredTop = triggerPageTop + rect.height + GAP;
    /* Preferred: right-aligned with trigger */
    var preferredLeft = triggerPageLeft - POPOVER_W + rect.width;

    /* Clip detection */
    var popoverH = 360;  /* estimated height */

    /* Flip left if clips right edge */
    if (rect.left + rect.width < POPOVER_W) {
      preferredLeft = triggerPageLeft;
    }
    /* Flip above if clips bottom */
    if (rect.bottom + popoverH > vpH) {
      preferredTop = triggerPageTop - popoverH - GAP;
    }

    /* Clamp to not go off left or top */
    if (preferredLeft < window.scrollX) { preferredLeft = window.scrollX + 8; }
    if (preferredTop < window.scrollY) { preferredTop = window.scrollY + 8; }

    popoverEl.style.top = preferredTop + 'px';
    popoverEl.style.left = preferredLeft + 'px';
  }


  /* ---- 4. Focus trap ---- */
  function getFocusableElements() {
    return Array.prototype.slice.call(
      popoverEl.querySelectorAll(
        'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), a[href]'
      )
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  function handlePopoverKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closePopover();
      return;
    }
    if (e.key !== 'Tab') { return; }

    var focusable = getFocusableElements();
    if (focusable.length === 0) { return; }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      /* Shift+Tab: if on first, wrap to last */
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      /* Tab: if on last, wrap to first */
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /* Global Esc and click-outside listeners (active for duration of popover life) */
  function handleDocKeydown(e) {
    if (e.key === 'Escape' && popoverEl && popoverEl.classList.contains('fb-popover--open')) {
      e.preventDefault();
      closePopover();
    }
  }

  function handleDocMousedown(e) {
    if (!popoverEl || !popoverEl.classList.contains('fb-popover--open')) { return; }
    /* If click is inside popover or on the trigger itself, do nothing */
    if (popoverEl.contains(e.target)) { return; }
    if (currentTrigger && currentTrigger.contains(e.target)) { return; }
    closePopover();
  }


  /* ---- 5. Submit handler ---- */
  function handleSubmit() {
    var textarea = document.getElementById('fb-textarea');
    var submitBtn = document.getElementById('fb-submit');
    var submitErr = document.getElementById('fb-error-msg');
    var fieldErr = document.getElementById('fb-textarea-error');
    var nameInput = document.getElementById('fb-name');
    var emailInput = document.getElementById('fb-email');

    if (!textarea || !submitBtn) { return; }

    /* Guard: clear previous submit error */
    if (submitErr) {
      submitErr.textContent = '';
      submitErr.classList.remove('fb-submit-error--visible');
    }

    /* Precondition: IS_CONFIGURED (belt-and-suspenders guard) */
    if (!IS_CONFIGURED) { return; }

    /* Precondition: feedback_text must be non-empty */
    var feedbackText = textarea.value.trim();
    if (feedbackText.length === 0) {
      textarea.classList.add('fb-textarea--error');
      textarea.setAttribute('aria-invalid', 'true');
      if (fieldErr) {
        fieldErr.classList.add('fb-field-error--visible');
      }
      textarea.focus();
      return;
    }

    /* Build payload — timestamp OMITTED (server generates it) */
    var payload = {
      page_url:      window.location.href,
      element_id:    currentTrigger ? (currentTrigger.dataset.feedbackTarget || 'general-feedback') : 'general-feedback',
      element_label: currentTrigger ? (currentTrigger.dataset.feedbackLabel  || 'General Feedback') : 'General Feedback',
      feedback_text: feedbackText,
      name:          nameInput  ? nameInput.value.trim()  : '',
      email:         emailInput ? emailInput.value.trim() : '',
      user_agent:    navigator.userAgent,
      viewport:      window.innerWidth + 'x' + window.innerHeight
    };

    /* Submitting state */
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-disabled', 'true');
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.classList.add('fb-submit--submitting');
    submitBtn.innerHTML = SVG_SPINNER + '<span>Submitting…</span>';   /* … = … */

    fetch(FEEDBACK_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.ok === true || data.status === 'ok') {
          showSuccess();
        } else {
          showSubmitError(data.error || 'Unknown error');
          restoreSubmitBtn();
        }
      })
      .catch(function (err) {
        showSubmitError(err.message || 'Network error');
        restoreSubmitBtn();
      });
  }

  function restoreSubmitBtn() {
    var submitBtn = document.getElementById('fb-submit');
    var textarea = document.getElementById('fb-textarea');
    if (!submitBtn) { return; }
    submitBtn.classList.remove('fb-submit--submitting');
    submitBtn.removeAttribute('aria-busy');
    submitBtn.textContent = 'Submit feedback';
    /* Re-evaluate disabled state from textarea content */
    var hasContent = textarea && textarea.value.trim().length > 0;
    submitBtn.disabled = !hasContent;
    submitBtn.setAttribute('aria-disabled', hasContent ? 'false' : 'true');
  }

  function showSuccess() {
    var body = document.getElementById('fb-popover-body');
    if (!body) { return; }
    body.innerHTML = '';                   /* clear form */

    var successDiv = document.createElement('div');
    successDiv.className = 'fb-success';
    successDiv.id = 'fb-success-msg';
    successDiv.setAttribute('role', 'status');
    successDiv.innerHTML = SVG_CHECK;      /* static SVG */

    var successText = document.createElement('p');
    successText.className = 'fb-success-text';
    successText.textContent = 'Thank you! Your feedback was recorded.'; /* textContent — safe */
    successDiv.appendChild(successText);
    body.appendChild(successDiv);

    /* Auto-close after 2500ms */
    autoCloseTimer = setTimeout(closePopover, 2500);
  }

  function showSubmitError(msg) {
    var submitErr = document.getElementById('fb-error-msg');
    if (!submitErr) { return; }
    submitErr.textContent = 'Submission failed — please try again.'; /* textContent — safe; ignores raw msg for security */
    submitErr.classList.add('fb-submit-error--visible');
  }


  /* ---- 6. DOM scan and icon injection ---- */
  function injectIcons() {
    var hosts = document.querySelectorAll('[data-feedback]');
    Array.prototype.forEach.call(hosts, function (host) {
      var label = host.dataset.feedback;

      /* Ensure host is positioned */
      if (window.getComputedStyle(host).position === 'static') {
        host.style.position = 'relative';
      }

      /* Determine ID for the host element */
      var hostId = host.id;
      if (!hostId) {
        /* Generate slug from label if no id */
        hostId = label.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase();
      }

      /* Determine if host has a visible border (sections/KPI cards with borders get -4px outset;
         chart cards without borders get 8px inset) */
      var computedBorder = window.getComputedStyle(host).borderTopWidth;
      var hasBorder = parseFloat(computedBorder) > 0;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fb-icon' + (hasBorder ? '' : ' fb-icon--inset');
      btn.setAttribute('aria-label', 'Leave feedback for ' + label);
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.dataset.feedbackTarget = hostId;
      btn.dataset.feedbackLabel = label;
      btn.innerHTML = SVG_BUBBLE;         /* static SVG */

      btn.addEventListener('click', function () {
        if (popoverEl && popoverEl.classList.contains('fb-popover--open') && currentTrigger === btn) {
          closePopover();
        } else {
          openPopover(btn, hostId, label);
        }
      });

      host.appendChild(btn);
    });
  }

  /* ---- 7. Floating general-feedback button ---- */
  function createFloatingButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'fb-floating-btn';
    btn.setAttribute('aria-label', 'Leave general feedback');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');

    btn.innerHTML = SVG_BUBBLE.replace('width="20" height="20"', 'width="20" height="20"'); /* speech bubble icon */
    var label = document.createElement('span');
    label.className = 'fb-btn-label';
    label.textContent = 'Feedback';
    btn.appendChild(label);

    btn.addEventListener('click', function () {
      if (popoverEl && popoverEl.classList.contains('fb-popover--open') && currentTrigger === btn) {
        closePopover();
        btn.setAttribute('aria-expanded', 'false');
      } else {
        currentTrigger = btn;
        btn.setAttribute('aria-expanded', 'true');
        openPopover(btn, 'general-feedback', 'General Feedback');
      }
    });

    document.body.appendChild(btn);
  }

  /* ---- Wire global event listeners ---- */
  document.addEventListener('keydown', handleDocKeydown);
  document.addEventListener('mousedown', handleDocMousedown);

  /* ---- Init on DOMContentLoaded ---- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    /* Create popover singleton and backdrop up front so keydown listener is ready */
    popoverEl = createPopover();
    backdropEl = createBackdrop();

    /* Wire popover keydown for focus trap and Esc */
    popoverEl.addEventListener('keydown', handlePopoverKeydown);

    injectIcons();
    createFloatingButton();
  }

})();
