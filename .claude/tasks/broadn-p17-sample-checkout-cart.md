# Task: broadn-p17-sample-checkout-cart

**Human request:** Build the sample-checkout feature — a multi-sample cart in the Data Explorer that submits a batch request through the existing Google Apps Script → Sheet write-bridge (reusing the feedback-widget pattern), replacing today's per-row `mailto:` link.

**Routing:** full pipeline (PM → Critic → [UI/BE/FE] → Auditor → REQVAL → Archivist). Multi-domain.

**Locked decisions (human, 2026-07-10):**
1. **Backend = reuse Apps Script → Sheet bridge.** Extend `apps-script/Code.gs` with a "Requests" sheet tab + request handling in `doPost`; client POSTs via the existing `text/plain;charset=utf-8` fetch pattern. No hosted server.
2. **Interaction = multi-sample cart / checkout.** Add-to-cart per Explorer row → cart badge → review step → one batch request form → submit.

**Status:** PM decomposition dispatched.
**Agents spawned:** PM#1 (seq 4)
