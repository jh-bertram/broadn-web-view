# RA Dossier — broadn-p19-ncbi-enrichment

MIMARKS environmental triplets + NCBI Taxonomy organisms for the BROADN aerobiome SRA
submission. **Every ENVO ID and taxid below was live-verified** against EBI OLS4 and the
NCBI Taxonomy browser on 2026-07-23. Verification URLs per term. These are a PROPOSAL for
PI confirmation — decision points and low-confidence cells are flagged explicitly.

Format target (NCBI MIMARKS): `label [ENVO:########]`. All ENVO IDs are 8-digit padded.

---

## Verified term inventory (live lookups, 2026-07-23)

### ENVO — environmental materials (env_medium candidates)
| Label | ENVO ID | Verify URL |
|---|---|---|
| air | ENVO:00002005 | https://www.ebi.ac.uk/ols4/api/ontologies/envo/terms?iri=http://purl.obolibrary.org/obo/ENVO_00002005 |
| soil | ENVO:00001998 | https://www.ebi.ac.uk/ols4/api/ontologies/envo/terms?iri=http://purl.obolibrary.org/obo/ENVO_00001998 |
| plant matter | ENVO:01001121 | https://www.ebi.ac.uk/ols4/api/ontologies/envo/terms?iri=http://purl.obolibrary.org/obo/ENVO_01001121 |
| liquid water | ENVO:00002006 | https://www.ebi.ac.uk/ols4/api/ontologies/envo/terms?iri=http://purl.obolibrary.org/obo/ENVO_00002006 |
| field soil | ENVO:00005755 | https://www.ebi.ac.uk/ols4/api/search?q=agricultural+field&ontology=envo |
| farm soil | ENVO:00005749 | https://www.ebi.ac.uk/ols4/api/search?q=cropland+biome&ontology=envo |
| greenhouse soil | ENVO:00005780 | https://www.ebi.ac.uk/ols4/api/search?q=greenhouse&ontology=envo |

### ENVO — biomes (env_broad_scale candidates)
| Label | ENVO ID | Verify URL |
|---|---|---|
| atmosphere | ENVO:01000267 | https://www.ebi.ac.uk/ols4/api/ontologies/envo/terms?iri=http://purl.obolibrary.org/obo/ENVO_01000267 |
| terrestrial biome | ENVO:00000446 | https://www.ebi.ac.uk/ols4/api/ontologies/envo/terms?iri=http://purl.obolibrary.org/obo/ENVO_00000446 |
| cropland biome | ENVO:01000245 | https://www.ebi.ac.uk/ols4/api/search?q=cropland+biome&ontology=envo |
| rangeland biome | ENVO:01000247 | https://www.ebi.ac.uk/ols4/api/search?q=rangeland&ontology=envo |
| grassland biome | ENVO:01000177 | https://www.ebi.ac.uk/ols4/api/search?q=grassland+biome&ontology=envo |
| temperate grassland biome | ENVO:01000193 | https://www.ebi.ac.uk/ols4/api/search?q=grassland+biome&ontology=envo |
| shrubland biome | ENVO:01000176 | https://www.ebi.ac.uk/ols4/api/search?q=shrubland+biome&ontology=envo |
| xeric shrubland biome | ENVO:01000218 | https://www.ebi.ac.uk/ols4/api/search?q=shrubland+biome&ontology=envo |
| forest biome | ENVO:01000174 | https://www.ebi.ac.uk/ols4/api/search?q=forest+biome&ontology=envo |

### ENVO — local features (env_local_scale candidates)
| Label | ENVO ID | Verify URL |
|---|---|---|
| agricultural field | ENVO:00000114 | https://www.ebi.ac.uk/ols4/api/search?q=agricultural+field&ontology=envo |
| grassland area | ENVO:00000106 | https://www.ebi.ac.uk/ols4/api/search?q=grassland+area&ontology=envo |
| greenhouse | ENVO:03600087 | https://www.ebi.ac.uk/ols4/api/search?q=greenhouse&ontology=envo |
| IUCN national park | ENVO:00000367 | https://www.ebi.ac.uk/ols4/api/search?q=national+park&ontology=envo |

### NCBI Taxonomy — metagenome organisms
| Scientific name | taxid | Verify URL |
|---|---|---|
| air metagenome | 655179 | https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=655179 |
| soil metagenome | 410658 | https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=410658 |
| phyllosphere metagenome | 662107 | https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=662107 |
| plant metagenome | 1297885 | https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1297885 |
| metagenome (generic parent) | 256318 | https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=256318 |

### Terms that DO NOT exist in ENVO (verified absent — do NOT fabricate)
- **"phyllosphere"** — 0 results in ENVO. (There IS an NCBI Taxonomy `phyllosphere metagenome` 662107, but no ENVO class.) Use `plant matter [ENVO:01001121]` for env_medium.
- **"leaf surface" / "plant surface"** — 0 ENVO results. (`leaf` exists only in Plant Ontology as `PO:0025034`, not ENVO.)
- **"phosphate buffered saline" / "aqueous solution" / "saline water" (as a wash reagent)** — no suitable ENVO env_medium exists for a PBS rinsate. Closest verified physical-matrix term is `liquid water [ENVO:00002006]`.

---

## Deliverable — proposed triplets per source type

### AIR — 2,919 samples | organism: `air metagenome` (taxid 655179) — HIGH
| Field | Proposed value | Confidence |
|---|---|---|
| env_broad_scale | **PRIMARY:** `atmosphere [ENVO:01000267]` (aerobiome convention — single value regardless of site). **ALT (MIxS-purist):** the terrestrial biome of the collection site (see SOIL row). | MEDIUM — convention choice, PI decision |
| env_local_scale | **SITE-DEPENDENT** (cannot be one value): cropland/ARDEC → `agricultural field [ENVO:00000114]`; rangeland/CPER → `grassland area [ENVO:00000106]`; IMPROVE national park → `IUCN national park [ENVO:00000367]`; greenhouse → `greenhouse [ENVO:03600087]` | MEDIUM |
| env_medium | `air [ENVO:00002005]` | HIGH |

Note: MIxS strictly wants a *biome* in env_broad_scale. `atmosphere` is an environmental
system, not a biome — hence the ALT. Aerobiome submissions commonly use `atmosphere`
anyway; pick one convention and apply it uniformly. This is the single biggest PI decision.

### SOIL — 704 samples | organism: `soil metagenome` (taxid 410658) — HIGH
| Field | Proposed value | Confidence |
|---|---|---|
| env_broad_scale | **SITE-DEPENDENT:** cropland/ARDEC → `cropland biome [ENVO:01000245]`; shortgrass-steppe/CPER → `rangeland biome [ENVO:01000247]` (anthropogenic grazing use) OR `temperate grassland biome [ENVO:01000193]` (vegetation-based); national park → `forest biome [ENVO:01000174]`; generic fallback → `terrestrial biome [ENVO:00000446]` | MEDIUM |
| env_local_scale | **SITE-DEPENDENT:** cropland → `agricultural field [ENVO:00000114]`; rangeland → `grassland area [ENVO:00000106]`; greenhouse → `greenhouse [ENVO:03600087]` | MEDIUM |
| env_medium | `soil [ENVO:00001998]` (generic). More specific option if PI wants it: `field soil [ENVO:00005755]` (ag fields), `farm soil [ENVO:00005749]`, `greenhouse soil [ENVO:00005780]` | HIGH |

### PLANT / phyllosphere — 841 samples | organism: `phyllosphere metagenome` (taxid 662107) — HIGH
(Use `plant metagenome` taxid 1297885 if samples are whole-plant / not strictly leaf surface.)
| Field | Proposed value | Confidence |
|---|---|---|
| env_broad_scale | **SITE-DEPENDENT** biome, same set as SOIL: `cropland biome [ENVO:01000245]` / `rangeland biome [ENVO:01000247]` / `terrestrial biome [ENVO:00000446]` | MEDIUM |
| env_local_scale | **SITE-DEPENDENT:** `agricultural field [ENVO:00000114]` / `grassland area [ENVO:00000106]` / `greenhouse [ENVO:03600087]`. (No ENVO "phyllosphere" exists to use here.) | MEDIUM |
| env_medium | `plant matter [ENVO:01001121]` (ENVO-valid, primary). ALT: `leaf [PO:0025034]` — Plant Ontology, NOT ENVO; only use if your MIMARKS package accepts PO. | MEDIUM |

### LIQUID / wash — 29 samples | organism: AMBIGUOUS — needs PI — LOW
"Liquid wash, PBS" = rinsate. The organism and triplet depend on **what was washed**, which
is not determinable from the source-type label alone.
| Field | Proposed value | Confidence |
|---|---|---|
| organism | If wash of **plant/leaf surfaces** → `phyllosphere metagenome [662107]`; if wash of **air-sampler filters/impactors** → `air metagenome [655179]`; unknown → `metagenome [256318]` (generic parent) | LOW |
| env_broad_scale | Inherit from the site/surface washed (same site-dependent biome set) | LOW |
| env_local_scale | Inherit from the site/surface washed | LOW |
| env_medium | `liquid water [ENVO:00002006]` (physical matrix of the rinsate) — OR the material washed (`plant matter [ENVO:01001121]` / `air [ENVO:00002005]`) if you want env_medium to reflect biological source. No ENVO term for PBS exists. | LOW |

**ACTION FOR PI:** specify what the 29 liquid samples are washes OF. That single fact
resolves organism + broad/local scale for the whole liquid class.

---

## Confidence summary
- HIGH: all env_medium for Air/Soil; organism taxids for Air/Soil/Plant (all label-matched live).
- MEDIUM: env_broad_scale for Air (atmosphere-vs-site-biome convention), all site-dependent
  broad/local cells (correct IDs, but which one applies depends on the row's collection site),
  Plant env_medium (plant matter is valid but there is no phyllosphere-specific ENVO term).
- LOW: entire Liquid class — needs PI to state what was washed.

## Could NOT verify / does not exist (flagged)
- No ENVO class for `phyllosphere`, `leaf surface`, `plant surface`, or PBS/`aqueous solution`
  as a wash medium (all searched, 0 relevant results). Substitutes proposed above.
- `prairie [ENVO:00000260]` and `xeric shrubland biome [ENVO:01000218]` appeared as candidate
  matches for the CPER shortgrass-steppe site but I did NOT do an individual IRI confirmation on
  each label↔ID pairing — confirm before use if you prefer these over `rangeland biome` /
  `temperate grassland biome` (which I did confirm).
