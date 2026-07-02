# BROADN Project-Page Content Recon — 2026-06-22

Reconnaissance for bucket B (richer per-project pages). Combines the **spreadsheet
inventory** (`Bdb-317.xlsx`, per-project leads/collaborators/publications/biomass
coverage) with **web recon** of the public BROADN site and publications. Run inline
after the background researcher agent died on a spurious Usage-Policy API error;
photo-URL harvesting was intentionally dropped (we link to bio pages instead).

## (a) BROADN website — structure

Canonical site: **https://broadn.colostate.edu/**

| Page | URL | Value for project pages |
|---|---|---|
| About / What We Do | https://broadn.colostate.edu/about/ | Mission narrative, 3 research goals |
| Who We Are (team) | https://broadn.colostate.edu/our-team/ | 38 people, each with a bio page |
| Research | https://broadn.colostate.edu/research/ | Thin — nav hub only |
| **Current Projects** | https://broadn.colostate.edu/projects/ | **21 full project descriptions** (lead, desc, location, co-Is), grouped by goal |
| Publications | https://broadn.colostate.edu/publications/ | ~15 pubs 2023–2026 with DOIs |

**Mission narrative (verbatim seed):** "BROADN aims to advance biologic discovery by
assembling transdisciplinary expertise to study the aerobiome and investigate airborne
biotic content." Three goals: (1) Establish standards for aerobiome sampling & analysis;
(2) Develop a predictive model of aerobiome composition; (3) Develop a mechanistic model
for microbe survival. Lead PI: **Dr. Sue VandeWoude** (Dean, CVMBS). Aspirational Goal
Leaders: Mark Hernandez, Pankaj Trivedi, Brad Borlee.

## (b) Spreadsheet project ↔ website project ↔ publication mapping

The website organizes work by *research question*; the spreadsheet by *collection
campaign*. Mapping (spreadsheet `Project ID` → website project #):

| Spreadsheet project | N | Lead (sheet) | Website project | Location | Publication / data |
|---|--:|---|---|---|---|
| IMPROVE Fungi | 1918 | Fierer | #12 Aerobiomes of America (7 IMPROVE sites, fungal) | US national parks | — (Gering 2024 related) |
| Fragmented Landscape | 1246 | Fierer | #9 Sources & Patterns in a Fragmented Landscape (co-I **Claire Winfrey**) | South Carolina | **NCBI PRJNA1263026** (16S/ITS, 403 biosamples, CU Boulder, 2025-05-14) |
| Spring SASS/Polycarbonate | 600 | Kreidenweis | Goal-1 sampler-eval family (#1–#4) | CPER | — |
| Fall Plant Circle | 595 | Trivedi | #6 Drivers of Aerobiome in Central Grasslands | CO grassland | — |
| Fall Plants & Soil | 594 | Trivedi | #6/#7 grassland aerobiome | CPER | — |
| Flux | 540 | Farmer | #10 Surface-atmosphere Flux (DNA at multiple heights) | grasslands | — |
| BACS | 494 | Kreidenweis | BACS field campaign | CPER/storms | **Ascher 2026, BAMS** doi:10.1175/BAMS-D-25-0105.1 |
| Spring Plant Circle | 480 | Trivedi | #6 grassland | CPER | — |
| Spring Sass/VIVAS | 299 | Kreidenweis | Goal-1 sampler eval | CPER | — |
| Ice-Nucleating Particles | 202 | Kreidenweis | #11 INP Emissions by Raindrop Impact (lead Claudia Mignani) | CO grassland | **Mignani 2025, JGR Atmos** doi:10.1029/2024JD042584 |
| Two Towers | 136 | Stewart | #8 Habitat Types Over Time, two towers | CO grassland+forest | **Cornell 2026, mBio** doi:10.1128/mbio.03057-25 |
| 2024 Summer / SGRC | 136/16 | Borlee | Goal-3 rhamnolipid/INP-protein (#16,#17) | SGRC | Borlee MRA genome announcements 2025 |
| Algae Bloom | 24 | Hancock | (Taylor Hancock, Doane) | — | — |
| Big Spring Texas | 13 | Magzamen | #4 Drone Mini-SASS eval | Big Spring, TX | — |

All three `External Resources` links in the sheet are now resolved: PRJNA1263026 →
Fragmented Landscape; 10.1029/2024JD042584 → INP; 10.1128/mbio.03057-25 → Two Towers.

## (c) People — PI roster (bio pages exist for all marked)

PIs / leads relevant to our projects (full 38-person roster on /our-team/):

| Name | Institution | Bio page |
|---|---|---|
| Sue VandeWoude (lead PI) | CSU CVMBS | /sue-vandewoude-bio/ |
| Sonia Kreidenweis | CSU Atmospheric Science | /sonia-kreidenweis-bio/ |
| Noah Fierer | CU Boulder | /noah-fierer-bio/ |
| Pankaj Trivedi | CSU | /pankaj-trivedi-bio/ |
| Delphine Farmer | CSU Chemistry | (not on team page list; verify) |
| Jane E. Stewart | CSU | /jane-e-stewart-bio/ |
| Brad Borlee | CSU | /brad-borlee-bio/ |
| Sheryl Magzamen | CSU | /sheryl-magzamen-bio/ |
| Angela Bosco-Lauth | CSU | /angela-bosco-lauth-bio/ |
| Amaya Garcia Costas | CSU-Pueblo | /amaya-garcia-costas-bio/ |
| Franziska Sandmeier | CSU-Pueblo | /franziska-sandmeier-bio/ |
| Erin Doyle | Doane | /erin-doyle-bio/ |
| Taylor Hancock | Doane | /our-team-taylor-hancock/ |
| Mark Hernandez | CU Boulder | /our-team-mark-hernandez/ |
| Jan Leach | CSU | /jan-e-leach-bio/ |
| Ken Reardon | CSU | /kenneth-reardon-bio/ |

Note: **Jonathan Bertram** (data owner) is listed under Staff (/our-team-johnathan-bertram/).
Recurring collaborators in the sheet (Nieto-Caballero, Kevin Barry, Claire Winfrey,
Russell Perkins, Jessica Metcalf, Eleah Flockhart) all appear in website co-I lists.

## (d) Publications with abstracts/citations (3 key + bonus)

- **Two Towers** — Cornell, C.R., Miller, A.E., Nieto-Caballero, M., Burns, K.S.,
  Kreidenweis, S.M., Abdo, Z., Stewart, J.E. (2026). *Spatiotemporal patterns of airborne
  microbial communities in forest and grassland ecosystems.* mBio. doi:10.1128/mbio.03057-25
- **INP** — Mignani, C., Hill, T.C.J., Nieto-Caballero, M., Barry, K.R., Bryan, N.C., et al.
  (2025). *Ice-nucleating particles are emitted by raindrop impact.* JGR: Atmospheres
  130(11):e2024JD042584. doi:10.1029/2024JD042584
- **BACS** — Ascher, B., Barbero, T.W., ... DeMott, P.J., et al. (2026). *The BioAerosols and
  Convective Storms (BACS) Field Campaigns.* BAMS. doi:10.1175/BAMS-D-25-0105.1
- **Fragmented Landscape data** — NCBI BioProject PRJNA1263026 (16S/ITS marker-gene surveys
  of near-surface bioaerosols + nearby soils/plants; 403 biosamples; CU Boulder; 2025).
- Bonus, useful for an "about the science" panel: Fierer et al. 2025 *Guidelines for
  preventing/reporting contamination in low-biomass microbiome studies* (Nat. Microbiology)
  — directly relevant to Claire's "low-biomass samples failed sequencing" point.

(Full abstract text was not scraped from publisher sites to avoid the policy trip that
killed the agent; DOIs resolve to abstracts on demand.)

## (e) Content-availability matrix & GAPS

**Have (web + sheet), ready to build pages:** Two Towers, INP, Fragmented Landscape,
Flux, the Trivedi grassland projects, BACS, the Goal-1 sampler-eval family, Borlee Goal-3
projects, Big Spring/drone — all have a website description + named lead + (most) a
publication or data accession.

**Gaps to request from the team:**
- **Photos/images** — none harvested (deliberately). Project pages have no image assets
  yet; would need the team to supply field/lab photos, or we embed publication figures
  under their licenses.
- **IMPROVE Fungi / Aerobiomes of America** — website description exists but no dedicated
  publication yet; richest sample count but thinnest narrative-to-publication link.
- **Delphine Farmer** bio page not confirmed on the team list (verify URL).
- **Per-project abstracts** — pull from DOIs at build time rather than storing.

## Bucket C reality check (from sheet)
- `qPCR` column: **0 populated rows across all 28 projects** — biomass-by-project chart
  NOT feasible from current data.
- `Nucleic Acid Concentration`: ~40 rows total (INP 19, Spring Plants & Soil 13, Filter
  Sterilization 6). `Ice-Nucleating Particles` column: 0 populated.
- No sampling-height/elevation column exists → Claire's height plot also unsupported.
- → Both of Claire's proposed new plots are blocked on **data entry**, not on build work.
