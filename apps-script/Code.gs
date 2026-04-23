/**
 * BROADN Feedback Collector — Google Apps Script web app
 *
 * Deploy: see apps-script/SETUP.md
 *
 * CORS note: GAS does not handle HTTP OPTIONS preflight (Finding #5, RA evidence_brief 2026-04-23).
 * The client must send Content-Type: text/plain;charset=utf-8 with a JSON-stringified body.
 * text/plain is a CORS-safelisted header value — no preflight is triggered.
 * This is the only verified workaround; doOptions() is intentionally absent (GAS ignores it).
 *
 * Platform contract: Google calls doPost(e) directly when an HTTP POST is received.
 * There is no user JS call chain inside the GAS runtime. doPost and doGet are the only
 * handlers GAS exposes; all other HTTP verbs are silently dropped.
 * (Source: https://developers.google.com/apps-script/guides/web)
 *
 * Payload schema (client sends; timestamp is server-generated — NOT in client payload):
 *   {
 *     page_url:      string,   // document.location.href at time of submission
 *     element_id:    string,   // e.g. "kpi-card-field-samples" or "general-feedback"
 *     element_label: string,   // e.g. "KPI: Field Samples"
 *     feedback_text: string,   // non-empty required
 *     name:          string,   // optional; empty string if unset
 *     email:         string,   // optional; empty string if unset
 *     user_agent:    string,   // navigator.userAgent
 *     viewport:      string,   // e.g. "1920x1080" (window.innerWidth + "x" + window.innerHeight)
 *   }
 *
 * Spreadsheet row (server appends; column order is fixed and must not change):
 *   [timestamp, page_url, element_id, element_label, feedback_text, name, email, user_agent, viewport]
 */

// ─── Configuration (human sets these values during setup — see SETUP.md) ─────

const SHEET_ID   = 'PASTE_SHEET_ID_HERE';  // Replace with the ID from your Google Sheet URL
const SHEET_NAME = 'Feedback';             // Must match the tab name in your Google Sheet

// ─── Column definition (fixed — must match client payload field names) ────────

const HEADERS = [
  'Timestamp',
  'Page URL',
  'Element ID',
  'Element Label',
  'Feedback',
  'Name',
  'Email',
  'User Agent',
  'Viewport'
];

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * doPost(e) — receives feedback submissions from the BROADN dashboard.
 *
 * Called by Google directly on HTTP POST. No user JS chain inside GAS.
 * Body arrives as e.postData.contents (raw string); parsed with JSON.parse.
 * e.parameter is intentionally NOT used — it is for form-encoded (application/x-www-form-urlencoded)
 * POSTs, which would be empty for text/plain payloads.
 *
 * @param {GoogleAppsScript.Events.DoPost} e - The POST event object from GAS runtime.
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response {ok: boolean, error?: string}
 */
function doPost(e) {
  try {
    // 1. Parse body — client sends text/plain with JSON-stringified body.
    //    Must use e.postData.contents, NOT e.parameter (which is for form-encoded POSTs).
    var payload = JSON.parse(e.postData.contents);

    // 2. Validate required field — empty feedback_text returns {ok: false} with HTTP 200.
    //    (GAS cannot reliably set non-200 status codes from doPost.)
    var feedbackText = (typeof payload.feedback_text === 'string')
      ? payload.feedback_text.trim()
      : '';
    if (feedbackText.length === 0) {
      return buildResponse({ ok: false, error: 'Empty feedback text' });
    }

    // 3. Coerce all fields to string (undefined → "") and sanitize user-controlled values.
    //    Timestamp is server-generated; it does NOT need sanitizing.
    //    sanitizeForSheet guards against formula injection (=, +, -, @ prefixes).
    var timestamp    = new Date().toISOString();
    var pageUrl      = sanitizeForSheet(String(payload.page_url      || ''));
    var elementId    = sanitizeForSheet(String(payload.element_id    || ''));
    var elementLabel = sanitizeForSheet(String(payload.element_label || ''));
    feedbackText     = sanitizeForSheet(feedbackText);
    var name         = sanitizeForSheet(String(payload.name          || ''));
    var email        = sanitizeForSheet(String(payload.email         || ''));
    var userAgent    = sanitizeForSheet(String(payload.user_agent    || ''));
    var viewport     = sanitizeForSheet(String(payload.viewport      || ''));

    // 4. Open sheet and ensure header row exists on first write.
    var ss    = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (sheet === null) {
      console.error('BROADN Feedback: sheet tab "' + SHEET_NAME + '" not found in spreadsheet ' + SHEET_ID);
      return buildResponse({ ok: false, error: 'Sheet not found — check SHEET_NAME in Code.gs' });
    }

    if (sheet.getLastRow() === 0) {
      // First write: auto-create header row.
      sheet.appendRow(HEADERS);
    }

    // 5. Append data row in exact fixed column order.
    //    Order: [timestamp, page_url, element_id, element_label, feedback_text, name, email, user_agent, viewport]
    sheet.appendRow([
      timestamp,
      pageUrl,
      elementId,
      elementLabel,
      feedbackText,
      name,
      email,
      userAgent,
      viewport
    ]);

    // 6. Return success.
    return buildResponse({ ok: true });

  } catch (err) {
    console.error('BROADN Feedback doPost error: ' + err.message);
    return buildResponse({ ok: false, error: err.message });
  }
}

/**
 * doGet() — optional status probe.
 * Allows a human to open the deployment URL in a browser and confirm it is live.
 *
 * @returns {GoogleAppsScript.Content.TextOutput} JSON status message.
 */
function doGet() {
  return buildResponse({ status: 'BROADN feedback endpoint ready' });
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * buildResponse — wraps an object as a ContentService JSON TextOutput.
 * All doPost and doGet responses must go through this function to ensure
 * consistent MIME type. Returning HtmlOutput or null causes CORS errors on
 * the browser fetch() response.
 *
 * @param {Object} obj - The response object to serialize.
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function buildResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * sanitizeForSheet — prevents formula injection in Google Sheets.
 *
 * If a user-controlled string starts with one of the four Sheets/Excel formula
 * trigger characters (=, +, -, @), a single-quote prefix is prepended so that
 * Sheets treats the cell value as a literal string rather than a formula.
 * This prevents payloads such as =IMPORTDATA(...) from executing when the sheet
 * owner opens the spreadsheet.
 *
 * Only user-controlled fields are routed through this function.
 * The server-generated timestamp is exempt (we control its content).
 *
 * @param {string} s - The string to sanitize.
 * @returns {string} The sanitized string.
 */
function sanitizeForSheet(s) {
  if (typeof s !== 'string' || s.length === 0) return s;
  if (/^[=+\-@]/.test(s)) return "'" + s;
  return s;
}
