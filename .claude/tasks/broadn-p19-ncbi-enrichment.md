# Task: broadn-p19-ncbi-enrichment

**Human request (follow-on to p18):** Human confirmed the 5 open decisions and authorized editing the LOCAL copy of `Bdb-317.xlsx` (changes here don't touch main; human mirrors them in parallel). Apply the straightforward NCBI metadata enrichments + verify the two open questions.

**Routing:** ORC-direct (acting as PM). Phase A = parallel verified research (read-only). Phase B = enrichment implementation (mutates a NEW xlsx copy, never the original) through the audited pipeline.

## Human's answers to p18 open decisions
1. **Rollup: CONFIRMED** (Field-Sample-as-BioSample) — locked, no change.
2. **instrument_model/library_layout:** human unsure if uniform, "probably most did" (sequencing). Data has ZERO recoverable instrument/platform info (verified inline). → reclassify as submission-constants-to-confirm; need actual value(s) from PI.
3. **site→country (geo_loc_name):** confirmed straightforward → build per-site lookup (RA#3).
4. **PRJNA1263026:** human believes deposited; asked how to verify → RA#1 verifies on NCBI.
5. **402 sign-flipped longitudes:** ANSWERED inline — 390 logical (780 raw) Fragmented Landscape / "South Carolina" (33.6, +81.8→−81.8) / PI Fierer; 12 logical (24 raw) Algae Bloom / Doane University Nebraska (40.6215, +96.949→−96.949) / PI Hancock. Common thread: both are "Other"-bucket out-of-Colorado sites entered with positive (should be negative) longitude. Fix = negate longitude for exactly these 2 coordinate clusters.

## Grounding facts (verified-on-disk 2026-07-23)
- Source types (Field Samples): Air 2919, Plant 841, Soil 704, Liquid 29, Unknown 1 → ENVO + organism need ONE triplet PER SOURCE TYPE (ST p18 only handled Air well — organism refinement needed).
- Location codes: SGRC 1982, IMPROVE 1056 (US national-park network sub-sites), CPER 649, Other 635, Foothills Campus 74, NWT 48, ARDEC 27, Big Spring Texas 13, PGF 8, Unknown 2.
- Sequence 16s/ITS/18s columns hold RUN IDs (SR##, PTSR##) = real library identifiers; one value = "NCBI".
- 63 shotgun-metagenome FASTQ files (MetaGenome Sequence col, `*_1.fq.gz`) — human is mid-download from a colleague's OneDrive. These are a SEPARATE metagenome SRA track from the amplicon (16S/ITS/18S) submission.

## Phase A — parallel verified research (read-only)
- RA#1: verify NCBI BioProject PRJNA1263026 (deposited? #BioSamples/#SRA runs? amplicon vs metagenome? release status? submitter=Fierer?).
- RA#2: ENVO triplets (real IDs) + NCBI Taxonomy metagenome organism per source type (Air/Soil/Plant/Liquid). Adversarially verify every ENVO ID/taxid against OLS.
- RA#3: geo_loc_name per location code (NCBI "Country: State, locality"), IMPROVE sub-sites → states; flag SGRC + PGF for PI.

## Phase B — enrichment (audited)
Apply to NEW file `docs/ncbi-readiness/Bdb-317_ncbi-enriched.xlsx` + changelog `docs/ncbi-readiness/ncbi_enrichment_changelog.md`: fix organism per source-type; add env_broad_scale/env_local_scale/env_medium; format geo_loc_name; correct 402 longitudes; reclassify instrument/layout as constants; re-run audit → updated readiness picture. Original `Bdb-317.xlsx` stays read-only.

## Status
- [x] Phase A research DONE (2026-07-23):
  - RA#1 (PRJNA): **PRJNA1263026 ALREADY SUBMITTED + PUBLIC** — 402 amplicon (187×16S + 215×ITS) SRA runs / 403 BioSamples, released 2026-03-15, CU Boulder (Fierer inst.). Caveat: 403 deposited vs 624 tagged → reconcile by alias, exclude only matched subset (~200 physical samples ×2 markers); ~222 unmatched rows are candidates for new submission.
  - RA#2 (ENVO+organism): verified terms per source type. Air→"air metagenome"[655179], env_medium air[ENVO:00002005]. Soil→"soil metagenome"[410658], soil[ENVO:00001998]. Plant→"phyllosphere metagenome"[662107], plant matter[ENVO:01001121]. Liquid(29)→AMBIGUOUS (LOW conf, needs PI). env_broad_scale/env_local_scale are SITE-DEPENDENT (verified variant set: cropland/grassland/national-park/greenhouse biomes+features). Air env_broad_scale = PI convention choice: atmosphere[ENVO:01000267] vs site-biome. VERIFIED-ABSENT (never fabricate): "phyllosphere", "leaf surface", PBS as ENVO terms.
  - RA#3 (geo_loc): all named codes resolved w/ sources — CPER/ARDEC/NWT/Foothills=Colorado, Big Spring=Texas, IMPROVE 6 parks→states, Other=SC(Fierer)+Doane Univ NE(Hancock). SGRC=Semi-Arid Grasslands Research Center (CO, PI-confirm mapping), PGF=CSU Plant Growth Facilities (CO, greenhouse).
  - [ ] ENVO adversarial verify (independent OLS4 spot-check) — pending, before any DB write.
  - **2 open PI decisions:** (a) air env_broad_scale convention; (b) what the 29 "Liquid wash" samples were washes OF.
- PI decisions RESOLVED: air env_broad_scale = atmosphere[ENVO:01000267]; 29 liquid-wash = PLANT (→ phyllosphere metagenome[662107], plant matter[ENVO:01001121]).
- **POST-ENRICHMENT ESTIMATE (computed on real data via audit.py rollup, 2026-07-23):** among 2,926 amplicon-sequenced samples, after filling organism/geo_loc/ENVO-triplet + fixing 402 longitude sign-flips + treating instrument/layout as upload constants:
  - **library_ID constructible (realistic): 2,234 (76%) metadata-complete; ~692 (24%) still need metadata — almost entirely collection_date (654; the SOLE blocker for 652).** lat_lon adds 40. Date-gaps cluster in Fragmented Landscape (429, mostly already-submitted PRJNA) + BACS (220).
  - library_ID = existing Aerobiome Barcode (strict): only 1,217 (42%) complete; residual dominated by 1,485 barcode-absent — but every amplicon sample HAS an SR run-id, so library_ID is constructible (28 distinct SR tokens = run/plate IDs, not per-sample) → NOT a true gap.
  - Caveat: "metadata-complete" ≠ "ready" — amplicon raw FASTQ are NOT in the DB (separate from the 63 metagenome files); complete samples are "ready_pending_files" until amplicon FASTQs located.
- [x] Phase B DELIVERABLE PIVOTED (human: source xlsx has formulas/scripts, can't paste cells) → produced an **Excel-add-in instruction sheet** instead of an enriched file: `docs/ncbi-readiness/ncbi_enrichment_instructions.md`. Human hands it to the in-Excel Claude agent with the sheet loaded.
  - Auto-fillable by rule: organism, env_medium, env_broad_scale (air=atmosphere), env_local_scale, geo_loc_name, library_ID; + longitude sign-fix (804 rows, rule: Longitude>0 → negate).
  - Flagged for PI: collection_date (654; BACS 220 + Frag-Landscape 429[mostly deposited]); SGRC/PGF facility confirm; 2 Unknown locations; NWT/Big Spring/SC biomes; instrument_model=Illumina MiSeq + library_layout=paired (from PRJNA1263026 evidence).
  - Self-verified: all counts vs data; 11 ENVO IDs + 3 taxids independently re-checked via OLS4/NCBI. **Caught+fixed: ROMO/VOYA unmapped IMPROVE parks; ENVO:00000367 mislabel ('area of'→'IUCN national park'); lon count 802→804.**
- [ ] (optional) independent audit of instruction sheet + archive
