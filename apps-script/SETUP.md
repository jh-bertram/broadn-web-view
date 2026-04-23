# BROADN Feedback Collector — Setup Guide

This guide walks you through deploying the `apps-script/Code.gs` file as a Google Apps Script
web app so that feedback submissions from the BROADN dashboard are written to a Google Sheet.

No server, no npm, no credentials file. You need only a Google account and a browser.

---

## Prerequisites

- A Google account (Gmail or Google Workspace)
- A browser (Chrome recommended)
- Access to [script.google.com](https://script.google.com) and [drive.google.com](https://drive.google.com)

---

## Step 1 — Create the Google Sheet

1. Open [drive.google.com](https://drive.google.com).
2. Click **New** > **Google Sheets** > **Blank spreadsheet**.
3. Rename the spreadsheet (click the title "Untitled spreadsheet" at the top left) to something
   like **"BROADN Feedback"**.
4. Rename the first sheet tab (at the bottom, currently "Sheet1") to **"Feedback"**.
   - Double-click the tab name, type `Feedback`, press Enter.
   - If you use a different tab name, you must set `SHEET_NAME` in `Code.gs` to match exactly
     (case-sensitive).
5. Note the **Sheet ID** from the browser URL. It is the long alphanumeric string between `/d/`
   and `/edit`:

   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                         This is your Sheet ID
   ```

   Copy this ID — you will paste it into `Code.gs` in Step 3.

---

## Step 2 — Open Google Apps Script

1. Go to [script.google.com](https://script.google.com).
2. Click **New project** (top left).
3. Rename the project from "Untitled project" to something like **"BROADN Feedback Collector"**
   (click the project name at the top).

---

## Step 3 — Paste the Code and Configure

1. In the Apps Script editor, you will see a default file called `Code.gs` with an empty
   `function myFunction()` body. **Select all that text and delete it.**
2. Open `apps-script/Code.gs` from this repository and copy its entire contents.
3. Paste the contents into the Apps Script editor.
4. Find the two configuration constants near the top of the file and update them:

   ```javascript
   var SHEET_ID   = 'PASTE_SHEET_ID_HERE';  // ← Replace with the ID you copied in Step 1
   var SHEET_NAME = 'Feedback';             // ← Change only if you used a different tab name
   ```

5. Click the **Save** icon (floppy disk) or press `Ctrl+S` / `Cmd+S`.

---

## Step 4 — Deploy as a Web App

1. Click the **Deploy** button (top right) > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment configuration:
   - **Description:** `BROADN Feedback v1` (optional but helpful for tracking versions later)
   - **Execute as:** **Me** (your Google account)
     - This means the script always runs as you, the owner, regardless of who submits feedback.
       It uses your credentials to write to your Sheet.
   - **Who has access:** **Anyone**
     - This allows the public BROADN dashboard (hosted on GitHub Pages) to POST feedback
       without requiring visitors to be signed in to Google.
     - **Note for personal Gmail accounts:** Some Gmail accounts show only "Only myself" and
       "Anyone with Google account" — omitting a fully anonymous option. If you see this, you
       may need to use a Google Workspace account, or consider an alternative backend
       (e.g., Formspree). Verify which options your account shows before proceeding.
4. Click **Deploy**.
5. Google will ask you to **authorize** the script — see Step 5.
6. After authorization, a dialog shows the **Web app URL**. It looks like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```
   **Copy this URL.** You will paste it into `assets/feedback-config.js` in Step 6.

---

## Step 5 — Authorize the Script

The first deployment triggers a Google OAuth consent screen. This is expected and safe — the
script is requesting permission to read and write to your own Google Sheet.

1. Click **Authorize access**.
2. Choose your Google account from the list.
3. You may see a warning: **"Google hasn't verified this app"**. This appears for any script
   you write yourself that hasn't been submitted for Google's formal review. It does NOT mean
   the script is malicious — it is your own code.
   - Click **Advanced**.
   - Click **Go to BROADN Feedback Collector (unsafe)**.
4. Review the permissions Google requests:
   - "See, edit, create, and delete all your Google Sheets spreadsheets" — required to
     append rows to your Sheet.
5. Click **Allow**.
6. You are returned to the deployment dialog with the Web app URL. Copy it.

---

## Step 6 — Paste the URL into the Dashboard Config

1. Open `assets/feedback-config.js` in this repository.
2. Replace the empty string with the Web app URL you copied:

   ```javascript
   window.BROADN_FEEDBACK_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
   ```

3. Save the file. Commit and push to GitHub Pages if you want the live site updated.

---

## Step 7 — Test the Integration

1. Open the dashboard (either via `file://` locally or via the GitHub Pages URL).
2. Click any feedback icon on the page (the speech-bubble icons at the corner of each section).
3. Type some feedback text in the textarea and click **Submit**.
4. Open your Google Sheet (from Step 1).
5. You should see a new row with 9 columns:
   `Timestamp | Page URL | Element ID | Element Label | Feedback | Name | Email | User Agent | Viewport`

If the row appears, the integration is working correctly.

---

## Step 8 — Updating the Script Code Later

**Important:** When you update `Code.gs`, you must NOT create a new deployment. A new deployment
generates a new URL, which would require updating `assets/feedback-config.js` and redeploying
the dashboard.

Instead, follow these steps to update code while keeping the same URL:

1. Edit the `Code.gs` source in the Apps Script editor.
2. Click **Deploy** > **Manage deployments**.
3. Click the pencil (edit) icon next to your existing deployment.
4. Under **Version**, click the dropdown and select **"New version"**.
5. Click **Deploy** (not "New deployment").

The URL remains unchanged. All existing client config continues to work.

---

## Troubleshooting

### CORS error in browser console

The BROADN widget sends requests with `Content-Type: text/plain;charset=utf-8` specifically to
avoid CORS preflight. If you see a CORS error:

- Confirm the fetch in `assets/feedback-widget.js` uses `Content-Type: text/plain;charset=utf-8`
  (not `application/json`). Changing this header causes a preflight OPTIONS request that
  Google Apps Script cannot respond to, resulting in a CORS block.
- Confirm the deployment is set to **"Who has access: Anyone"** (not "Only myself").
- Verify the Web app URL in `assets/feedback-config.js` is the correct `/exec` endpoint,
  not the Apps Script editor URL.

### "Authorization required" or 401 response

- Open the Apps Script deployment settings and confirm **"Who has access: Anyone"**.
- If your account only shows "Anyone with Google account", unauthenticated visitors cannot
  submit feedback. Consider a Google Workspace account or an alternative backend service.

### Submissions appear in the Sheet but in the wrong columns

- The column order is fixed in `Code.gs`:
  `[Timestamp, Page URL, Element ID, Element Label, Feedback, Name, Email, User Agent, Viewport]`
- If you modified the `HEADERS` array or the `sheet.appendRow([...])` call in `Code.gs`, the
  order must match exactly. Refer to the comment block at the top of `Code.gs` for the
  canonical column order.
- If the header row was already created with a different order, delete it from the Sheet
  (row 1) and the next submission will regenerate it correctly.

### Sheet not found / no rows appearing

- Double-check `SHEET_ID` in `Code.gs` — it must match the alphanumeric ID in your Google
  Sheet's URL (between `/d/` and `/edit`).
- Double-check `SHEET_NAME` — it must match the tab name exactly (case-sensitive). The default
  is `Feedback`.
- Confirm you saved `Code.gs` in the Apps Script editor AND redeployed (or edited the existing
  deployment with a new version) after your last code change.
- In the Apps Script editor, click **Execution log** (left sidebar) to see recent runs and
  any error messages.

### 404 or "Script function not found"

- Confirm the deployment URL ends in `/exec` (not `/dev` — the `/dev` URL requires you to be
  signed in as the script owner and is for testing only).
- Confirm the script file is named `Code.gs` (not `code.gs` or `Code.js`).

### Empty `feedback_text` silently rejected

- The script returns `{ok: false, error: "Empty feedback text"}` with HTTP 200 if the
  `feedback_text` field is empty. The client widget will show an inline error in the popover.
  This is expected behavior — it prevents blank rows in the Sheet.

---

## Security Considerations

**The deployment URL is semi-public.** The Web app URL is pasted into `assets/feedback-config.js`,
which is committed to the public GitHub Pages repository. Anyone who views your page source can
discover the endpoint URL.

**Consequence:** Any party with the URL can POST arbitrary rows to your Sheet, including spam or
formula-injection attempts (e.g. `=IMPORTDATA(...)`). `Code.gs` mitigates formula injection by
prepending a single-quote to any user-controlled value that begins with `=`, `+`, `-`, or `@`
before it is written to the Sheet, so those values are stored as literal text rather than
executed as formulas.

**If the URL is abused:** Go to the Apps Script editor → **Deploy** → **Manage deployments** →
click the pencil icon → **Archive** the active deployment. Generate a fresh deployment, copy the
new URL, paste it into `assets/feedback-config.js`, and redeploy the dashboard. The old URL stops
accepting requests immediately upon archival.

**Privacy note:** Each submission records the submitter's `user_agent` string and the full page
URL. Submissions are therefore not fully anonymous at the browser level. If your audience includes
research participants or users who expect anonymity, add a one-line disclosure — for example:
*"Feedback submissions are not anonymous and include your browser type and current page URL."*
