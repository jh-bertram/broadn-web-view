# broadn-p17-t2-be — Sample Request Backend (Apps Script)

## Payload Contract (canonical — FE builds against this)

Client sends a JSON-stringified body with `Content-Type: text/plain;charset=utf-8`
(same CORS-safelisted workaround already used by the feedback widget — see the
CORS note at the top of `apps-script/Code.gs`) to the URL in `window.BROADN_REQUEST_URL`
(`assets/feedback-config.js`, aliased to `window.BROADN_FEEDBACK_URL` — one shared
`/exec` deployment):

```json
{
  "kind": "sample_request",
  "samples": [
    {
      "sample_id": "string",
      "sample_type": "string",
      "sample_site": "string",
      "sample_date": "string",
      "sample_project": "string",
      "sample_stage": "string"
    }
  ],
  "requester_name": "string",
  "requester_email": "string",
  "affiliation": "string",
  "intended_use": "string",
  "page_url": "string",
  "user_agent": "string"
}
```

- `samples` must be a non-empty array for a meaningful request; server code treats a
  missing/non-array `samples` as `[]` (defensive `Array.isArray` guard in
  `handleSampleRequest`) and will simply append zero sample rows plus still return
  `{ok:true}` — **FE should client-side-validate `samples.length > 0` before
  submitting**; the server does not reject an empty cart.
- All fields are coerced to `String(... || '')` server-side, so `undefined`/`null`
  are safe to send.
- `Timestamp` and `Request ID` are **server-generated** — do not include them in the
  client payload; they are ignored if present.

## Requests Sheet — Fixed Column Order (14 columns, one row per sample)

Auto-written as the header row on first submission (mirrors the Feedback tab's
header-on-first-write behavior):

1. `Timestamp` (server-generated, `new Date().toISOString()`, shared across all rows of one request)
2. `Request ID` (server-generated, `Utilities.getUuid()`, shared across all rows of one request)
3. `Requester Name`
4. `Requester Email`
5. `Affiliation`
6. `Intended Use`
7. `Sample ID`
8. `Sample Type`
9. `Sample Site`
10. `Sample Date`
11. `Sample Project`
12. `Sample Stage`
13. `Page URL`
14. `User Agent`

A cart of N samples produces N rows sharing the same Timestamp + Request ID (columns
1-2), with columns 3-6 and 13-14 also repeated per row (requester/page context is
constant per request) and columns 7-12 varying per sample.

## Response Shape

```
{ ok: true }
```
or
```
{ ok: false, error: string }
```

Possible `error` values: `'Requests sheet not found'` (the `Requests` tab does not
exist in the spreadsheet at `SHEET_ID`), or a caught exception's `err.message`
(mirrors the feedback path's error envelope exactly — same shape, same
`buildResponse` wrapper, same HTTP-200-always constraint documented in `doPost`'s
JSDoc).

## Reference `SampleRequestInputSchema` (Zod) — documentation artifact

```typescript
import { z } from 'zod';

const SampleItemSchema = z.object({
  sample_id: z.string(),
  sample_type: z.string(),
  sample_site: z.string(),
  sample_date: z.string(),
  sample_project: z.string(),
  sample_stage: z.string(),
});

export const SampleRequestInputSchema = z.object({
  kind: z.literal('sample_request'),
  samples: z.array(SampleItemSchema).min(1),
  requester_name: z.string(),
  requester_email: z.string().email(),
  affiliation: z.string(),
  intended_use: z.string(),
  page_url: z.string(),
  user_agent: z.string(),
});

export type SampleRequestInput = z.infer<typeof SampleRequestInputSchema>;
```

**Auditor note (verbatim, per task packet):** This Zod schema is a REFERENCE/documentation
artifact only. The site has no bundler; there is intentionally NO runtime Zod import.
The runtime validator is hand-written vanilla JS in T3. Do NOT treat a missing
runtime-Zod import as a standards defect.

## `<files_modified>`

- `assets/feedback-config.js` — added 1 line: `window.BROADN_REQUEST_URL = window.BROADN_FEEDBACK_URL;` (alias, existing `BROADN_FEEDBACK_URL` line byte-identical)
- `apps-script/Code.gs` — added `REQUEST_SHEET_NAME`, `REQUEST_HEADERS` consts; added `handleSampleRequest(payload)` function; added one-line `doPost` branch on `payload.kind === 'sample_request'`. No existing lines removed or altered.
- `apps-script/SETUP.md` — added "Step 7a — Requests Sheet (Sample Checkout Cart)" section (14-column order + `BROADN_REQUEST_URL` client-config note) and a "Deployment Revocation" section (shared-deployment revoke/re-deploy procedure). No existing lines removed or altered.
- `docs/agent-logs/BE/broadn-p17-t2-be.md` and `docs/agent-logs/BE/latest.md` — agent checkpoint log (Stage 1/2/3).

## Verification Grep Output (actual, captured this run)

**Step 2 — `feedback-config.js` byte-stability:**
```
$ git diff HEAD -- assets/feedback-config.js | grep -c '^-[^-]'
0
```

**Step 3 — `Code.gs` verification (all three):**
```
$ git diff HEAD -- apps-script/Code.gs | grep -E '^-' | grep -E "SHEET_NAME = 'Feedback'|'Timestamp',|'Feedback',"
(no output — exit code 1 / no match, as required)

$ grep -c 'function sanitizeForSheet' apps-script/Code.gs
1

$ grep -c 'handleSampleRequest' apps-script/Code.gs
4
```
(4 occurrences = JSDoc mention + function definition + `doPost` call site + JSDoc
reference in the doPost-branch comment context — ≥2 satisfied.)

**Additional self-imposed check — pure-addition confirmation for `Code.gs` and
`SETUP.md`:**
```
$ git diff HEAD -- apps-script/Code.gs | grep -c '^-[^-]'
0
$ git diff HEAD -- apps-script/SETUP.md | grep -c '^-[^-]'
0
```
Both zero — every changed file in this task is a pure addition; no existing line in
any of the three edited files was altered or removed.

**Syntax check (GAS runtime cannot be executed; `.gs` is ES5/ES6-ish JS parsed by
V8 — verified via `node --check` on a copy renamed to `.js`, since `node` refuses
the `.gs` extension outright):**
```
$ cp apps-script/Code.gs /tmp/.../Code.js && node --check /tmp/.../Code.js
SYNTAX OK
```

## Critical Logic Notes

- **Cannot execute the GAS runtime** (Google-side `SpreadsheetApp`, `ContentService`,
  `Utilities` are undefined outside Apps Script). Verification here is: (a) careful
  read against the existing feedback pattern it mirrors, (b) the git-diff/grep proofs
  above showing zero mutation to existing feedback-path code, (c) a Node.js
  `--check` syntax pass on a renamed copy of the file. No live GAS deployment or
  Sheet write was exercised — the human must paste-and-redeploy per the new SETUP.md
  "Deployment Revocation" section before `handleSampleRequest` goes live.
- `handleSampleRequest` reuses `sanitizeForSheet` and `buildResponse` — zero
  duplicated logic (DRY). Not re-declared.
- `SHEET_NAME`, `HEADERS`, `SHEET_ID`, and every existing feedback-path line in
  `doPost` are byte-identical to before this change (proven by the grep above)
  except for the single new one-line dispatch branch inserted immediately after
  `JSON.parse`.
- Defensive guard: `Array.isArray(payload.samples) ? payload.samples : []` prevents
  a malformed/missing `samples` field from throwing inside the loop; combined with
  the outer `try/catch` (mirrors the feedback handler's own try/catch), a malformed
  request degrades to `{ok:true}` with zero rows written rather than a 500-style
  crash — GAS doPost cannot reliably set non-200 status codes, so this matches the
  existing feedback handler's error-handling philosophy exactly.
- Every user/data-derived string field is routed through `sanitizeForSheet` before
  being written (formula-injection guard, same as feedback path). `timestamp` and
  `requestId` are server-generated and intentionally NOT sanitized (per task spec).
