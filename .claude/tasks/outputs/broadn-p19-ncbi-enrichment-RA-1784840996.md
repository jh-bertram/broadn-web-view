<research_dossier>
  <query>Verify deposit status of NCBI BioProject PRJNA1263026 — is it public and already filled, or reserved-but-embargoed? (BROADN "Fragmented Landscape", PI Fierer, 624 rows tagged.) Retrieved 2026-07-23.</query>

  <summary>
  PRJNA1263026 EXISTS and is fully PUBLIC (released 2026-03-15). It is NOT a reserved/empty
  placeholder: it holds 403 registered BioSamples and 402 SRA experiments/runs, 100% AMPLICON
  (16S + ITS rRNA marker-gene), submitted by University of Colorado Boulder (Fierer's institution)
  — a bioaerosol + nearby-soil + leaf survey that matches the fragmented-landscape aerobiome study.
  Bottom line: the deposited samples are ALREADY SUBMITTED and must be excluded from any new NCBI
  submission — BUT only 403 biosamples exist vs 624 BROADN-tagged rows, so the team must reconcile
  by sample alias which of the 624 are the already-deposited libraries rather than excluding all 624.
  </summary>

  <findings>
    <point>
      <claim>PRJNA1263026 exists as a public BioProject; NCBI UID = 1263026, esearch count = 1.</claim>
      <source>https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=bioproject&amp;term=PRJNA1263026&amp;retmode=json</source>
      <relevance>Confirms the accession is real and indexed in the PUBLIC eutils database (reserved/embargoed-only accessions are not returned by public esearch). Retrieved 2026-07-23; JSON: {"count":"1","idlist":["1263026"]}.</relevance>
    </point>
    <point>
      <claim>Project title: "16S and ITS rRNA marker gene surveys of near-surface atmosphere bioaerosols and nearby soils and plants". Data type "Raw sequence reads"; target scope "Environment"; registration_date 2025/05/14; sequencing_status "SRA/Trace"; submitter_organization "University of Colorado Boulder".</claim>
      <source>https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=bioproject&amp;id=1263026&amp;retmode=json</source>
      <relevance>Directly confirms subject matter (bioaerosols + soils + leaves, 16S/ITS marker genes), submitting institution (CU Boulder = Fierer's institution), and that raw reads are attached (SRA/Trace). Verbatim project_description: "Near-surface atmosphere bioaerosols were collected and paired with samples collected from nearby surface soils and leaves to investigate the likely sources, spatial patterns, and microbial traits of the bacterial and fungal taxa identified in the bioaerosol samples." Retrieved 2026-07-23.</relevance>
    </point>
    <point>
      <claim>403 BioSamples are registered under the project.</claim>
      <source>https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=bioproject&amp;db=biosample&amp;id=1263026&amp;retmode=json</source>
      <relevance>elink linkname "bioproject_biosample" returned 403 links (also 403 for bioproject_biosample_all and bioproject_biosample_sp). NOTE: a plain esearch on db=biosample for "PRJNA1263026" returns count=0 because BioSample records store the BioProject as a structured link, not free-indexed text — so elink (403) is the authoritative BioSample count, not esearch. Retrieved 2026-07-23.</relevance>
    </point>
    <point>
      <claim>402 SRA experiments and 402 SRA runs (1 run per experiment) under SRA study SRP683882.</claim>
      <source>https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=sra&amp;term=PRJNA1263026%5BBioProject%5D&amp;retmode=json (count=402) cross-checked against https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=bioproject&amp;db=sra&amp;id=1263026&amp;retmode=json (bioproject_sra = 402 links)</source>
      <relevance>Two endpoints agree: 402. The runinfo CSV (below) has 402 rows with 402 distinct Experiment accessions and 402 distinct Run (SRR) accessions → 402 experiments = 402 runs. Retrieved 2026-07-23.</relevance>
    </point>
    <point>
      <claim>The data is AMPLICON (marker-gene), NOT shotgun metagenome. All 402 runs: LibraryStrategy=AMPLICON, LibrarySelection=PCR, LibrarySource=METAGENOMIC, Platform=Illumina MiSeq. Marker split by LibraryName: 187 x 16S (bacteria) + 215 x ITS (fungi) = 402.</claim>
      <source>SRA runinfo CSV via https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=sra&amp;query_key=1&amp;WebEnv=MCID_6a62934e5034d1de4f0a495f&amp;rettype=runinfo&amp;retmode=csv (WebEnv from esearch db=sra usehistory=y term=PRJNA1263026[BioProject]); reproducible without WebEnv via SRA Run Selector https://www.ncbi.nlm.nih.gov/Traces/study/?acc=PRJNA1263026</source>
      <relevance>Parsed 402 rows: LibraryStrategy Counter = {AMPLICON:402}; LibrarySelection={PCR:402}; LibrarySource={METAGENOMIC:402}; Platform={Illumina MiSeq:402}; BioProject={PRJNA1263026:402}. Confirms these are 16S+ITS amplicon libraries — consistent with the project title. No shotgun/WGS strategy present. Example run: SRR37633782, Experiment SRX32514309, LibraryName "ITS_69_bioaerosol", BioSample SAMN53932463. Retrieved 2026-07-23.</relevance>
    </point>
    <point>
      <claim>Sample organisms (NCBI Taxonomy) span the three environmental compartments: air metagenome (taxid 655179) x194, phyllosphere metagenome (taxid 662107) x117, generic metagenome (taxid 256318) x91.</claim>
      <source>Same runinfo CSV, TaxID/ScientificName columns.</source>
      <relevance>The air + phyllosphere (leaf) + generic (soil) breakdown matches the "bioaerosols + nearby soils and leaves" study design and the BROADN air/plant/soil source types. Retrieved 2026-07-23.</relevance>
    </point>
    <point>
      <claim>Release / embargo status: PUBLICLY RELEASED. All 402 runs carry ReleaseDate 2026-03-15 (min 2026-03-15 20:26:38, max 2026-03-15 20:26:54). BioProject submission SUB15320155, submitted/last_update 2025-05-14. Today is 2026-07-23, so the project was reserved in May 2025 and released ~4 months ago; no active embargo.</claim>
      <source>ReleaseDate: runinfo CSV (above). Submission id + dates: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=bioproject&amp;id=1263026 (XML) — verbatim: &lt;Submission last_update="2025-05-14" submission_id="SUB15320155" submitted="2025-05-14"&gt;</source>
      <relevance>Rules out "reserved-but-embargoed": the reads are past their release date and are downloadable now. Retrieved 2026-07-23.</relevance>
    </point>
    <point>
      <claim>Submitting organization = University of Colorado Boulder (owner). Individual PI/contact name is REDACTED in the public NCBI metadata, so the literal name "Fierer" cannot be read directly from NCBI — but the owning institution is Fierer's institution and the study subject (bioaerosol/soil/leaf 16S+ITS survey) matches a fragmented-landscape aerobiome study.</claim>
      <source>https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=bioproject&amp;id=1263026 — verbatim: &lt;Organization role="owner" type="institute"&gt;&lt;Name&gt;University of Colorado Boulder&lt;/Name&gt;&lt;!-- Contact information has been removed --&gt;&lt;/Organization&gt;</source>
      <relevance>Confirms institutional consistency with Fierer; the personal-name confirmation would require the BROADN internal record or a linked publication (NCBI strips submitter contact from the public XML). Retrieved 2026-07-23.</relevance>
    </point>
  </findings>

  <conflicting_data>
    No source conflicts on the deposit facts — esearch, esummary, elink, and runinfo agree the project
    is public and filled. Two reconcilable numeric points worth flagging (not contradictions):
    (1) elink reports 403 BioSamples but runinfo shows 402 BioSamples-with-runs → 1 registered BioSample
    has no linked SRA run (likely a blank/control or a sample registered without a submitted run).
    (2) Field-tagged esearch db=biosample "PRJNA1263026[BioProject]" and plain "PRJNA1263026" both return
    count=0; this is a BioSample-index behavior (structured link, not free text), not evidence of absence —
    elink is authoritative here.
  </conflicting_data>

  <staleness_risk>
    - Counts (402 runs / 403 biosamples) can grow if the lab adds more runs to the same accession; re-run
      the elink/esearch queries immediately before finalizing any dedup list. Low risk short-term (project
      already released).
    - CRITICAL for the sprint decision — the 624-vs-403 gap: only 403 BioSamples / 402 amplicon libraries
      are deposited, but 624 BROADN "Fragmented Landscape" rows are tagged with this accession. BioSamples
      appear to be registered PER SEQUENCING LIBRARY (per marker): 402 distinct biosamples == 402 runs,
      each carrying one of two markers (187 16S + 215 ITS). So the 402 libraries likely correspond to
      ~200 physical samples x 2 markers — far fewer than 624. Do NOT blindly exclude all 624 rows as
      "already submitted." The team (BE/ST) must reconcile by sample alias/name — deposited SampleName
      values follow patterns like "ITS_69", "phyllo_16S_66", "ITS_10" (with LibraryName suffixes
      "_bioaerosol" / "_blank") — to identify exactly which BROADN rows map to the 402 deposited libraries,
      exclude ONLY those, and treat the remaining rows as genuinely not-yet-deposited (or a different
      accounting unit) pending confirmation.
    - PI-name confirmation ("Fierer") is inferred from institution + subject, not read from NCBI (contact
      redacted). If a hard name match is required, cross-check against the BROADN internal record or a
      linked publication before asserting authorship.
  </staleness_risk>

  <bottom_line>
    ALREADY SUBMITTED (not reserved-but-unfilled). PRJNA1263026 is a live, public deposit containing
    402 AMPLICON (16S+ITS) SRA runs across 403 BioSamples, submitted by CU Boulder, released 2026-03-15.
    The BROADN rows that correspond to these deposited biosamples MUST be excluded from the new submission
    to avoid duplicate BioSamples. CAVEAT: 403 deposited < 624 tagged — reconcile by sample alias and
    exclude only the matched subset; the unmatched ~222 rows are candidates for the new submission and
    require confirmation, not automatic inclusion or exclusion.
  </bottom_line>

  <endpoints_status>
    Working (all HTTP 200, keyless, retrieved 2026-07-23): esearch (bioproject/sra/biosample), esummary
    (bioproject), elink (bioproject→biosample, bioproject→sra), efetch (sra runinfo CSV, bioproject XML).
    Failed/limited: WebFetch of the HTML page https://www.ncbi.nlm.nih.gov/bioproject/PRJNA1263026 returned
    only the JS template shell (client-rendered, no record data) — substituted by the efetch XML endpoint,
    which carries the same submitter/date fields. No NCBI_API_KEY in env; keyless E-utilities sufficed at
    &lt;3 req/s.
  </endpoints_status>

  <confidence>
    HIGH on: existence, public status, release date, amplicon-not-shotgun, 402 runs/experiments, 403
    biosamples, CU Boulder submitter, 16S+ITS marker split. MEDIUM on: literal PI = Fierer (institution +
    subject inferred, name redacted by NCBI). HIGH on the operational conclusion that a dedup/reconciliation
    step is required because deposited (403) < tagged (624).
  </confidence>
</research_dossier>
