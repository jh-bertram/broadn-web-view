# Task: broadn-p8-feedback-widget

**Human request:** Add a lightweight in-page feedback widget to the BROADN GitHub Pages dashboard so researchers can click a tiny icon next to any landmark element, type feedback, and submit — storing each submission in a Google Sheet via Google Apps Script. Deploy to GitHub Pages after browser verification.

**Agents spawned:** PM (decomposition) → Critic (plan gate) → [UI Designer, BE, FE] (implementation waves) → Auditor → Archivist

**Routing:** full pipeline (multi-domain: UI design + server code + client code + accessibility + deploy)

**Backend target:** Google Apps Script web app → Google Sheet (user's personal Google account; "Anyone" anonymous access confirmed available)

**Deployment:** GitHub Pages at https://jh-bertram.github.io/broadn-web-view/ (serves `main` branch, `/` path). Current branch is `sprint/broadn-p1-2026-03-22`; merge to `main` requires explicit human confirmation.
