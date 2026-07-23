# NCBI SRA Submission — Metadata Requirements for Amplicon Sequences (16S / ITS / 18S)

*BROADN data-management reference · compiled July 2026.*
**Built from the two NCBI SRA pages specified:** the [SRA Metadata & Submission Overview](https://www.ncbi.nlm.nih.gov/sra/docs/submitmeta/) and the [SRA Submission Portal / Wizard guide](https://www.ncbi.nlm.nih.gov/sra/docs/submitportal/). The environmental **BioSample** field specifics come from the BioSample *package* the wizard has you select (submitportal's "BioSample Type / Attributes" steps point there); that page is cited at the bottom.
*Package versions and validation rules change — confirm on the live pages before a real submission.*

---

## 1. How SRA is organized (from submitmeta)

An SRA submission is four linked objects, each with its own accession:

| Object | Accession | Is | Registered as |
|---|---|---|---|
| **STUDY** | `SRP#` | The study/project | **BioProject** |
| **SAMPLE** | `SRS#` | A biological/environmental sample | **BioSample** |
| **EXPERIMENT** | `SRX#` | One sequencing library + its prep | (SRA metadata) |
| **RUN** | `SRR#` | The read data files | (SRA metadata) |

Two things this page makes explicit and that matter for amplicon data:

- **"Paired-end data files (forward/reverse) must be listed together in the same RUN."**
- **"All data files listed in a RUN will be merged into a single `.sra` archive file."**

So: one sample → one BioSample → one Experiment per library → one Run holding that library's FASTQ(s).

---

## 2. The submission workflow (from submitportal)

You go through the **SRA Submission Portal Wizard**, in this order:

1. **NCBI account** → open the Submission Portal; (optionally) request a personal upload folder.
2. **Create submission** (gets a temporary `SUB#`).
3. **Submitter** — contact info / collaborators.
4. **General info** — is the BioProject/BioSample already registered? + release date.
5. **BioProject** — register if new (see §3).
6. **BioSample — Type** — *"Select a package for your samples"* (see §4).
7. **BioSample — Attributes** — organism/metagenome taxonomy + the package's sample fields (§4).
8. **SRA Metadata** — link project + samples to the sequencing data, via the built-in editor or the **Excel template** (§5).
9. **Files** — upload the reads (§6).
10. **Overview** — review and submit.

> Key portal rule: *"Make sure that every organism/metagenome, time point, tissue type or treatment type [has its] own sample."* Don't pool distinct BROADN samples into one BioSample.

---

## 3. BioProject (STUDY)

Register once: title, description, relevance (Environmental), submitting org / PI. Use **one BioProject for BROADN** (or per major sub-study) and attach every sample to it.

---

## 4. BioSample (SAMPLE) — package + attributes

At **BioSample → Type**, amplicon/marker-gene samples use a **MIMARKS: survey** package — pick the one matching the environment (**air** for aerobiome; also water, soil, host-associated, plant-associated as needed). At **BioSample → Attributes** you supply the organism (a metagenome taxonomy name, e.g. `air metagenome`) plus the package's required fields.

**Required fields (common core of the MIMARKS survey packages):**

| Field | Description | Example |
|---|---|---|
| `sample_name` | Unique sample ID (your key) | `BROADN_FLUX_2024_0157` |
| `organism` | Environmental **metagenome** taxonomy name | `air metagenome` |
| `collection_date` | Date (± time), ISO 8601 | `2024-06-15` or `2024-06-15T14:30` |
| `geo_loc_name` | Country: region, locality | `USA: Colorado, Fort Collins` |
| `lat_lon` | Decimal degrees + hemisphere | `40.5734 N 105.0865 W` |
| `env_broad_scale` | Broad environment (ENVO term) | `atmosphere [ENVO:01000267]` *(confirm ID)* |
| `env_local_scale` | Local environment (ENVO term) | `grassland biome [ENVO:01000177]` *(confirm)* |
| `env_medium` | Material sampled (ENVO term) | `air [ENVO:00002005]` |

The three `env_*` fields are the ones most often missing, and must be **ENVO ontology terms**, not free text. Some packages add one or two required fields (soil → `depth` + `elev`; water → `depth`) — check the package page. *(Full field list: BioSample package page in Sources.)*

---

## 5. SRA Metadata table (EXPERIMENT + RUN) — one row per library

Entered at the **SRA Metadata** step (built-in editor or Excel template). The template columns:

| Column | Amplicon value / note | Portal calls out as required |
|---|---|---|
| `biosample_accession` / `sample_name` | Links the run to its BioSample | ✔ |
| `library_ID` | *"unique library_ID that is short and meaningful"* | ✔ |
| `title` | Short human-readable title | |
| `library_strategy` | **AMPLICON** | ✔ (strategy) |
| `library_source` | **METAGENOMIC** (community) / `GENOMIC` (single isolate) | |
| `library_selection` | **PCR** | |
| `library_layout` | `paired` (2×250/2×300 MiSeq) or `single` | ✔ (layout) |
| `platform` | e.g. **ILLUMINA** | |
| `instrument_model` | e.g. **Illumina MiSeq** | ✔ (instrument model) |
| `filetype` | `fastq` | |
| `filename` (+ `filename2`) | The demultiplexed FASTQ(s); R1/R2 together in the RUN | ✔ (filename[s]) |
| `design_description` | *(recommended)* one line on prep | |

*(The "required" ticks are the fields the submitportal summary explicitly lists as needed in the template; the rest are standard template columns you set in the same step — the wizard supplies the controlled-vocabulary dropdowns for strategy/source/selection/platform.)*

---

## 6. Sequence file requirements (from submitportal)

- **Reads only.** *"SRA does NOT accept assembled/consensus data or contigs."* Submit **raw demultiplexed FASTQ** (don't trim away biological sequence; be consistent about primer removal).
- **Compression:** gzip or bzip2 allowed; a tarball is acceptable; **zip is NOT accepted.**
- **Size:** max **100 GB per (compressed) file**; split a study over 5 TB across multiple submissions (< 5 TB each).
- **Upload:** preload files (Aspera/cloud) then pick *"I have all files preloaded"* — or upload via HTTP/Aspera during submission; FTP + Aspera instructions provided.
- Paired R1/R2 belong to the **same RUN** (from §1).

---

## 7. Amplicon-specific fields — record these (make the data reusable)

Live on the BioSample package (MIxS/MIMARKS) and/or the experiment; strongly recommended for marker-gene data:

| Field | Description | Example |
|---|---|---|
| `target_gene` | Marker gene | `16S rRNA`, `ITS`, `18S rRNA` |
| `target_subfragment` | Region amplified | `V4`, `V3-V4`, `ITS1`, `ITS2` |
| `pcr_primers` | Forward/reverse primer **sequences** | `FWD:GTGYCAGCMGCCGCGGTAA; REV:GGACTACNVGGGTWTCTAAT` (515F/806R) |
| `seq_meth` | Sequencing method | `Illumina MiSeq 2x250` |
| `pcr_cond` / `mid` | *(optional)* conditions / barcode | — |

*(ITS example primers: ITS1F `CTTGGTCATTTAGAGGAAGTAA` / ITS2 `GCTGCGTTCTTCATCGATGC`.)*

---

## 8. Formatting rules (enforced at BioSample validation)

- **`collection_date`** — ISO 8601 (`YYYY`, `YYYY-MM`, `YYYY-MM-DD`, or `…Thh:mm`). *(Encode BROADN's AM/PM as the time, or keep a custom `samp_time` attribute.)*
- **`lat_lon`** — decimal degrees **with hemisphere letters**: `40.5734 N 105.0865 W`.
- **`geo_loc_name`** — starts with a country: `USA: Colorado, <site>`.
- **`organism`** — must match NCBI Taxonomy; use a `… metagenome` name for community amplicons.
- **`env_*`** — ENVO terms in the form `label [ENVO:########]`.
- Truly-absent required values → an INSDC term (`not collected`, `not applicable`, `missing`), never blank (but `env_*` should be real terms).

---

## 9. What this means for BROADN (field mapping)

| BROADN field | → NCBI field(s) |
|---|---|
| Sample ID | `sample_name` |
| Project / collection | custom attr (`project_name`) + BioProject |
| Site + coordinates | `geo_loc_name` + `lat_lon` |
| Collection date & time (AM/PM) | `collection_date` (encode time) |
| Sampler type | custom attr (`samp_collect_device`) |
| Substrate / host | `env_medium` (or `host`) |
| Sequencing type (16S / ITS) | `target_gene` + `target_subfragment` + `library_strategy=AMPLICON` |
| PI / contact | BioProject / submitter |

**NCBI-only extras to capture now:** the ENVO triplet (`env_broad/local/medium`); `lat_lon` + `geo_loc_name` in NCBI's exact string format; `target_subfragment` + `pcr_primers`; `instrument_model` + `library_layout`; the metagenome `organism` name.

---

## 10. Per-sample readiness checklist

- [ ] Under a BROADN **BioProject**
- [ ] Unique `sample_name`; valid metagenome `organism`
- [ ] `collection_date`, `geo_loc_name`, `lat_lon` present & correctly formatted
- [ ] `env_broad_scale` / `env_local_scale` / `env_medium` = real ENVO terms
- [ ] Package-specific required field(s) present (e.g. depth/elevation)
- [ ] If sequenced: `library_ID` (short, unique), `AMPLICON`, `library_source`, `PCR`, `library_layout`, `platform`, `instrument_model`
- [ ] `target_gene` / `target_subfragment` / `pcr_primers` recorded
- [ ] Raw **FASTQ** located; R1/R2 paired; gzip/bzip2 (not zip); < 100 GB/file

---

## Sources

1. **[SRA Metadata & Submission Overview](https://www.ncbi.nlm.nih.gov/sra/docs/submitmeta/)** — STUDY/SAMPLE/EXPERIMENT/RUN model; paired reads in one RUN; runs merged to `.sra`.
2. **[SRA Submission Portal / Wizard](https://www.ncbi.nlm.nih.gov/sra/docs/submitportal/)** — wizard step order; select a BioSample package; SRA metadata template fields; file-format & upload rules.
3. [BioSample MIMARKS: survey package](https://www.ncbi.nlm.nih.gov/biosample/docs/packages/MIMARKS.survey.soil.4.0/) — the environmental required-field definitions the wizard's package step points to.
