# Researcher — Evals

## Eval 1: Third-Party API Documentation

**Prompt:**
> We're integrating with Resend for transactional email. What are the current API rate limits, the request format for sending a templated email, and any known gotchas with their Node.js SDK?

**Expected output structure:**
- Wraps result in `<research_dossier>` XML
- All fields populated: `<query>`, `<summary>`, `<findings>`, `<conflicting_data>`, `<staleness_risk>`

**Quality assertions:**
- [ ] Every `<claim>` has a `<source>` URL — no unsourced assertions
- [ ] `<source>` URLs point to specific pages (docs.resend.com/...) not just the domain
- [ ] `<summary>` is exactly 3 sentences and actionable
- [ ] `<relevance>` explains how each finding affects *this* project — not generic descriptions
- [ ] `<staleness_risk>` is populated if rate limits or SDK version may change
- [ ] Conflicting sources are flagged if found — not silently resolved

---

## Eval 2: Technology Comparison

**Prompt:**
> We need to choose between Prisma and Drizzle ORM for our TypeScript + PostgreSQL stack. Compare them on: type safety, migration tooling, query performance, and ecosystem maturity.

**Expected output:**
- `<research_dossier>` with findings covering all four dimensions

**Quality assertions:**
- [ ] Both options covered — not a one-sided recommendation
- [ ] Each comparison point has sourced evidence — not opinion
- [ ] `<conflicting_data>` populated if benchmarks from different sources disagree
- [ ] `<summary>` names a recommended choice with a brief, sourced rationale — doesn't hedge without reason
- [ ] Does not look at application source code

---

## Eval 3: Open Dataset Acquisition (Tier 1)

**Prompt:**
> Download the NOAA Global Surface Summary of Day data for Chicago O'Hare airport (station ID 72530014819) for the year 2023. Save it to data/ and confirm integrity.

**Expected output:**
- `<data_acquisition_report>` XML block
- File saved to `data/`

**Quality assertions:**
- [ ] Uses `Bash` with `curl` — not `WebFetch` (WebFetch doesn't save binary files reliably)
- [ ] Checks file exists and is non-empty after download
- [ ] Reports row count and column names in `<schema_summary>`
- [ ] `<tier>` is `OPEN`
- [ ] `<license>` field populated (NOAA data is public domain)
- [ ] `<citation>` field populated
- [ ] Does NOT attempt data analysis — routes to Statistician

---

## Eval 4: Blocked Acquisition (Tier 2 — missing credentials)

**Prompt:**
> Download the ERA5 hourly temperature reanalysis for Europe in 2022 from the Copernicus Climate Data Store.

**Expected output:**
- `<credential_request>` XML block (not a download attempt)

**Quality assertions:**
- [ ] Checks for `CDS_API_KEY` in env before attempting download: `env | grep CDS`
- [ ] When key not found, emits `<credential_request>` and stops
- [ ] `<registration_url>` is the exact CDS registration page
- [ ] `<env_vars_needed>` lists `CDS_API_KEY` (and `CDS_URL` if needed)
- [ ] `<alternative>` suggests an open alternative (NOAA NCEI, NASA GISS, etc.)
- [ ] Does NOT attempt the download without credentials
- [ ] Does NOT emit fabricated data

---

## Eval 5: Security Advisory Check

**Prompt:**
> Are there any current CVEs or security advisories affecting jsonwebtoken versions below 9.0.0?

**Expected output:**
- `<research_dossier>` with CVE findings

**Quality assertions:**
- [ ] CVE IDs cited with NVD or GitHub Advisory source URLs
- [ ] Affected version ranges are precise — not "old versions"
- [ ] Fix version identified (9.0.0 or specific patch)
- [ ] `<staleness_risk>` notes new CVEs may be issued
- [ ] `<summary>` includes the remediation action
