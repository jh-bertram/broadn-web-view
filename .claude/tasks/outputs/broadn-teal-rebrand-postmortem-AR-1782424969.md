# Archivist Summary: BROADN Teal Rebrand Post-Mortem

**Task ID:** `broadn-teal-rebrand-postmortem`  
**Agent:** AR#1  
**Timestamp:** 2026-06-25T22:22:49Z  
**Event Type:** POST_MORTEM  

---

## What Was Archived

Post-mortem analysis of the BROADN teal rebrand delivery arc spanning two sprints:
- **P10 (broadn-p10-design-implementation)**: Design language evaluation and implementation; Critic issued BLOCK on unsatisfiable scope (#166534==0), then PASS on amendment; shipped DESIGN.md v2.0.0 with teal Constitution
- **P11 (broadn-p11-feedback-widget-teal)**: Feedback widget rebrand; first-pass through all gates
- **ORC-direct fixes**: Logo asset tracking + console 404 cleanup

---

## Key Findings

### Two Post-Delivery Runtime Bugs

**Bug 1: Logo 404 on GitHub Pages**
- Root cause: broadn-logo.webp asset was untracked (never git-added)
- Gap: commit-packet Step 4a checks JS imports but misses HTML `<img src>`, `<link href>`, CSS `url()` references
- Fix: tracked in commit bbe04ab; all 7 asset refs in index.html now tracked

**Bug 2: Feedback Widget FAB Transparent (P10 Regression)**
- Root cause: P10 removed --color-green-* CSS vars (no token consumer sweep)
- Fix: p11 repointed 6 refs to var(--color-teal-deep)
- Gap: no cross-file impact verification when removing/renaming CSS tokens

### Process Deviation

FE#1 pre-committed in p11 before audit gate (0ef1cc8); ORC amended with trailers (fd46e53) restoring invariant.

---

## Protocol Gaps Identified

| Gap | Issue | Fix Target | Routing |
|-----|-------|-----------|---------|
| 1 | commit-packet missing HTML/CSS asset closure | deterministic content-closure script | HR |
| 2 | no repo-wide consumer sweep on token removal | new skill or auditor hardening | HR |
| 3 | auditor stale-cache hazard (first-load render) | hard-reload/cache-bust standing QA | QA |
| 4 | FE self-commit before audit gate | frontend.md pre-flight mandate | frontend.md |

---

## Shipped Commits

1. **0cba237** — docs(design): DESIGN.md v2 teal Constitution
2. **c14d67b** — feat(dashboard): teal rebrand + P10 fixes
3. **bbe04ab** — fix(dashboard): commit broadn-logo.webp asset (Pages 404)
4. **fd46e53** — feat(rebrand): feedback-widget teal (p11)
5. **6b580ef** — fix(dashboard): console 404 cleanup + favicon

**Total delivery:** ~2.5 wall-clock hours (p10 PM SPAWN seq 11 → p11 AR COMPLETE seq 38)

---

## Entry Location

Archived to: `/home/jhber/projects/broadn-web-view/docs/project_log.md` (lines 1403–1430)

**Source post-mortem:** `docs/after-actions/broadn-teal-rebrand.md`

---

## Stage 3: COMPLETE

Archive entry written to project log. Post-mortem is now discoverable and linked to both sprint closures (p10 seq 24, p11 seq 38).
