# BROADN → NCBI/SRA: What Needs Attention

**Purpose:** step-by-step enrichment instructions to hand to the **Claude agent in the Excel add-in** with `Bdb-317.xlsx` loaded. It adds NCBI-submission columns and makes targeted corrections by rule — it never needs to overwrite your formula/script cells with pasted data.

**Ground rules for the in-Excel agent:**
- **Add new columns** (to the right of the table) and fill them **by the rules below**, keyed off existing columns. Do not modify existing formula columns except the one explicit correction in Part B.
- **Never invent an ontology term.** Every value below is either derived from an existing column or is a verified ENVO/NCBI term (verification URLs in Part F). Where a value can't be determined, **leave it blank and flag it** — see Part C.
- Header is row 1; data rows 2–7847. One logical sample = one **"Field Sample"** row; `Sample Product` rows are lab derivatives of their parent (link column: `Sample derived from`).
- Verified on the real data 2026-07-23. Counts are for **Field Sample** rows.

---

## A. Columns to ADD (auto-fill by rule)

Add these seven columns. Rules use the existing `Sample Source Type` and `Sample Collection Location` columns.

### A1. `organism` — by `Sample Source Type`
| Sample Source Type | organism (write exactly) |
|---|---|
| Air | `air metagenome` |
| Soil | `soil metagenome` |
| Plant | `phyllosphere metagenome` |
| Liquid | `phyllosphere metagenome`  *(PI-confirmed: the 29 liquid-wash samples are plant washes)* |
| Unknown / blank | **leave blank — flag (Part C3)** |

### A2. `env_medium` — by `Sample Source Type`
| Sample Source Type | env_medium (write exactly) |
|---|---|
| Air | `air [ENVO:00002005]` |
| Soil | `soil [ENVO:00001998]` |
| Plant | `plant matter [ENVO:01001121]` |
| Liquid | `plant matter [ENVO:01001121]` |
| Unknown / blank | leave blank — flag |

### A3. `env_broad_scale`
- **If `Sample Source Type` = Air → `atmosphere [ENVO:01000267]`** for every air sample, regardless of site (PI-confirmed convention).
- **Else (Soil / Plant / Liquid)** → by `Sample Collection Location`:

| Location | env_broad_scale | note |
|---|---|---|
| SGRC | `temperate grassland biome [ENVO:01000193]` | semi-arid grassland — dominant non-air site (1,103 samples) |
| CPER | `temperate grassland biome [ENVO:01000193]` | shortgrass steppe |
| ARDEC | `cropland biome [ENVO:01000245]` | agricultural |
| Foothills Campus | `temperate grassland biome [ENVO:01000193]` | **PI-confirm** (foothills grassland/shrubland) |
| Other (South Carolina) | *leave blank — flag* | Fragmented Landscape; **mostly already deposited (Part E)** — do not fill without PI |
| NWT | *leave blank — flag (Part C4)* | Niwot Ridge is alpine — different biome |

### A4. `env_local_scale` — by `Sample Collection Location`
| Location | env_local_scale | confidence |
|---|---|---|
| ARDEC | `agricultural field [ENVO:00000114]` | high |
| CPER | `grassland area [ENVO:00000106]` | high |
| SGRC | `grassland area [ENVO:00000106]` | high (state), PI-confirm site |
| IMPROVE (all sub-sites) | `IUCN national park [ENVO:00000367]` | high |
| PGF | `greenhouse [ENVO:03600087]` | high |
| Foothills Campus | `grassland area [ENVO:00000106]` | **PI-confirm** |
| NWT | *blank — flag (Part C4)* | alpine |
| Big Spring, Texas | *blank — flag (Part C4)* | needs local feature |
| Other (South Carolina) | *blank — flag* | mostly already deposited |
| Unknown | blank — flag | |

### A5. `geo_loc_name` — by `Sample Collection Location` (+ IMPROVE sub-site from `Sample Collection Specific Site`)
Write the string exactly. (Full sourcing in Part F.)

| Location (sub-site) | geo_loc_name |
|---|---|
| CPER | `USA: Colorado, Central Plains Experimental Range` |
| ARDEC | `USA: Colorado, Fort Collins` |
| NWT | `USA: Colorado, Niwot Ridge` |
| Foothills Campus | `USA: Colorado, Fort Collins` |
| Big Spring, Texas | `USA: Texas, Big Spring` |
| SGRC | `USA: Colorado, Semi-Arid Grasslands Research Center` — **PI-confirm facility** |
| PGF | `USA: Colorado, Fort Collins` — **PI-confirm facility** |
| IMPROVE + ACAD | `USA: Maine, Acadia National Park` |
| IMPROVE + EVER | `USA: Florida, Everglades National Park` |
| IMPROVE + GRCA | `USA: Arizona, Grand Canyon National Park` |
| IMPROVE + GRSM | `USA: Tennessee, Great Smoky Mountains National Park` |
| IMPROVE + HAVO | `USA: Hawaii, Hawaii Volcanoes National Park` |
| IMPROVE + OLYM | `USA: Washington, Olympic National Park` |
| IMPROVE + ROMO | `USA: Colorado, Rocky Mountain National Park` |
| IMPROVE + VOYA | `USA: Minnesota, Voyageurs National Park` |
| IMPROVE + "Unknown" sub-site | leave blank — flag (which park?) |
| Other, site = "South Carolina" | `USA: South Carolina` |
| Other, site = "Doane University" | `USA: Nebraska, Crete` |
| Unknown | leave blank — flag (Part C3) |

### A6. `library_ID` — constructed, only for sequenced samples
A `library_ID` just needs to be a **unique short name per sequencing library**. Your existing `Aerobiome Barcode` is blank for ~half of sequenced samples, so **construct one** instead:

- Rule: `library_ID = [BROADN ID] & "_" & marker`, where marker is `16S` / `ITS` / `18S` depending on which of `Sequence 16s` / `Sequence ITS` / `Sequence 18s` is populated.
- A sample sequenced for two markers (e.g. 16S **and** ITS) gets **two** library_IDs — this is one BioSample, two SRA libraries. (You can generate the per-marker rows at SRA-upload time; the sheet itself only needs `BROADN ID` as the unique BioSample name.)
- **This is not a real data gap** — every amplicon sample already has a run ID in its Sequence column; library_ID is just a name you assign.

---

## B. Correction to EXISTING data — longitude sign flip

**804 rows have a positive longitude that should be negative** (US sites entered without the minus sign; 402 Field-Sample rows + their 402 Product children). All are one of two clusters:
- **Fragmented Landscape / "South Carolina"** — lat ≈ 33.6, lon entered as **+81.8** → should be **−81.8** (780 rows)
- **Algae Bloom / "Doane University", Nebraska** — lat ≈ 40.62, lon entered as **+96.949** → should be **−96.949** (24 rows)

**Rule (safe — this dataset has no legitimate positive longitudes):**
> For every row where `Longitude > 0`, set `Longitude = -Longitude`.

Spot-check afterward: no row should have `Longitude > 0`; the two clusters should read −81.8 and −96.949.

---

## C. Needs YOU / the PI — cannot be auto-filled (do not invent)

### C1. `collection_date` — the one real metadata gap ⚑ **highest priority**
**654 amplicon-sequenced samples are missing a collection date.** After every other fix, this is the *only* blocker for ~650 of them. They concentrate in:
- **BACS — 220 samples** ← most tractable; recover these dates if you can.
- **Fragmented Landscape — 429 samples** ← but most of these are **already deposited** (Part E), so they largely fall out of scope.
- (a handful in other projects: Spring Plants & Soil 3, IMPROVE Fungi 1, Spring Sass/VIVAS 1)

Recovering the BACS dates alone moves the bulk of the remaining samples to metadata-complete. Where a date truly can't be recovered, NCBI accepts `missing` / `not collected`.

### C2. SGRC & PGF site-code confirmation
- **SGRC** (1,982 samples — your largest bucket): identified as **Semi-Arid Grasslands Research Center** (CSU/USDA-ARS, Colorado). State is safe (`USA: Colorado`); **confirm the exact facility/locality and what sub-sites "East" / "Environment" mean.**
- **PGF** (8 samples): identified as **CSU Plant Growth Facilities** (greenhouse, Fort Collins). Confirm.

### C3. `Unknown` location (2 samples)
No location string exists. Supply it, or submit with an NCBI missing-value term. Do not guess.

### C4. Biome/local-scale for the smaller sites
For **NWT** (Niwot Ridge, alpine), **Big Spring TX**, and any non-air **South Carolina** samples, the biome/local-scale isn't a simple grassland/cropland default. Candidate verified ENVO terms to pick from: `tundra biome [ENVO:01000180]` (NWT), `terrestrial biome [ENVO:00000446]` (generic fallback). PI to assign.

### C5. `instrument_model` + `library_layout` (see Part D — these are upload constants, not per-sample)
Not in the database at all. **Best evidence:** the already-deposited BROADN batch (PRJNA1263026) was sequenced on **Illumina MiSeq**, paired-end — so the amplicon runs are very likely `instrument_model = Illumina MiSeq`, `library_layout = paired`. **Confirm with whoever ran the sequencing.**

---

## D. Do NOT enter per-sample — these are set once at SRA upload

These are uniform "submission constants," not sample metadata. Don't add them as per-row columns or count them as gaps:
- `library_strategy = AMPLICON`
- `library_source = METAGENOMIC`
- `library_selection = PCR`
- `platform = ILLUMINA`
- `instrument_model = Illumina MiSeq` *(pending C5 confirmation)*
- `target_subfragment` (e.g. V4 for 16S, ITS1/ITS2) and `pcr_primers` — recommended; add once per marker at upload if known.

---

## E. Scope: exclude the already-submitted samples

**402 of your amplicon runs (187× 16S + 215× ITS, ≈200 physical samples) are already public on NCBI** under **BioProject PRJNA1263026** (Fragmented Landscape, released 2026-03-15, CU Boulder deposit). **Do not resubmit them** — duplicate BioSamples are rejected.

Caveat: NCBI lists **403** deposited BioSamples but your database tags **624** rows with this accession. Reconcile by sample ID before excluding — the ~220 unmatched rows may be genuine new-submission candidates. NCBI deposited sample names follow patterns like `ITS_69`, `phyllo_16S_66` — match these against your `Fragmented Landscape` rows.

---

## F. Verified reference (every ID was live-checked 2026-07-23)

**ENVO terms** (EBI OLS4 — label confirmed, none obsolete):
| Term | ID | verify |
|---|---|---|
| air | ENVO:00002005 | ✅ independently re-verified |
| soil | ENVO:00001998 | ✅ |
| plant matter | ENVO:01001121 | ✅ independently re-verified |
| atmosphere | ENVO:01000267 | ✅ independently re-verified |
| temperate grassland biome | ENVO:01000193 | researcher-verified |
| cropland biome | ENVO:01000245 | researcher-verified |
| grassland area | ENVO:00000106 | ✅ independently re-verified |
| agricultural field | ENVO:00000114 | researcher-verified |
| IUCN national park | ENVO:00000367 | ✅ independently re-verified |
| greenhouse | ENVO:03600087 | researcher-verified |
| tundra biome | ENVO:01000180 | candidate (NWT) |
| terrestrial biome | ENVO:00000446 | fallback |

Look up any ID at: `https://www.ebi.ac.uk/ols4/ontologies/envo/classes?iri=http://purl.obolibrary.org/obo/ENVO_<digits>`

**NCBI Taxonomy organisms** (browser-confirmed):
| organism | taxid |
|---|---|
| air metagenome | 655179 |
| soil metagenome | 410658 |
| phyllosphere metagenome | 662107 |

**Terms that do NOT exist in ENVO — never write these:** `phyllosphere`, `leaf surface`, `PBS`/`phosphate-buffered saline` as an env_medium. (Use `plant matter` for the plant/liquid medium instead.)

---

## Summary — where this gets you

After Parts A + B (all automatable) and confirming C5 (instrument):
- **~2,230 of ~2,900 amplicon samples (76%) become metadata-complete.**
- **~650 remain blocked, almost entirely on missing `collection_date`** (Part C1) — concentrated in BACS (220) and the already-deposited Fragmented Landscape set.
- "Metadata-complete" still needs the raw **amplicon FASTQ files located** before actual submission (separate from the 63 metagenome files) — a data-management task, not a metadata one.
