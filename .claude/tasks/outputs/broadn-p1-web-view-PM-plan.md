# PM Task Decomposition — BROADN Aerobiome Web Dashboard (Sprint 1)
# REVISED — Post-Critic CRITIQUE_BLOCK Resolution

**Task ID:** broadn-p1-web-view
**Revision:** v2 (addresses CRITIQUE_BLOCK issued by CR#0, 2026-03-17)
**PM:** PM#0
**Produced:** 2026-03-17
**Consultation inputs:**
- RA#1: `.claude/agents/tasks/outputs/broadn-p1-web-view-consult-RA-1742169601.md`
- ST#1: `.claude/agents/tasks/outputs/broadn-p1-web-view-consult-ST-1742169602.md`
- UI#1: `.claude/agents/tasks/outputs/broadn-p1-web-view-consult-UI-1742169603.md`

## Changes From v1

| Critic Finding | Severity | Resolution |
|---|---|---|
| Sequencing detection logic absent from XML task packet | BLOCKER | Added explicit filename-based detection rule to broadn-p1-data-prep description; added new success criterion; corrected risk flag row |
| Geocoding quality criteria absent from XML (only in MD prose) | BLOCKER | Merged all geocoding criteria into broadn-p1-data-prep XML packet (Option A); removed standalone broadn-p1-sites-geocoding as a separate XML task to eliminate ambiguity |
| FE hex color rule ambiguous — Chart.js and HTML badges both need color, Tailwind can't serve both | WARNING | Rule refined: hex/rgb permitted in Chart.js dataset config objects only; HTML badge colors must use a pre-defined static Tailwind class map keyed by sample type |
| 2-char composite site code parsing not described in XML | WARNING | Added explicit composite code explanation to broadn-p1-data-prep description |

---

## Decisions Made at Planning Time

### Tech Stack Decision: Static HTML + CDN (not React SPA)

**Rationale:**
1. The existing prototype is a single HTML file with Tailwind CDN + Chart.js CDN and works well
2. No npm, no build system, no Node.js required — consistent with "no package.json" project state
3. The human has explicitly demonstrated comfort with the CDN approach (working prototype exists)
4. Data is "slowly being added" — the update workflow should be a Python script re-running to regenerate `data/data.json`, not a full React build
5. The page is a public-facing read-only dashboard — no form submission, no authentication, no state management requiring Redux/Zustand
6. CDN-delivered Leaflet.js handles the map requirement without a build step
7. TypeScript strict mode (per standards.md) applies only if the project uses TypeScript; a static HTML project defaults to plain JS — acceptable given the no-build constraint

**Libraries (all CDN):**
- Tailwind CSS CDN — `https://cdn.tailwindcss.com`
- Chart.js — `https://cdn.jsdelivr.net/npm/chart.js`
- Leaflet.js — `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` + CSS

### Data Loading Strategy: Pre-processed JSON (not runtime xlsx)

**Rationale:**
1. Parsing xlsx in the browser requires SheetJS (~1MB library) and is slow for 8000 rows
2. Pre-aggregating in Python produces a ~20-50KB data.json with exactly the data the charts need
3. The preprocessing script (Python) runs offline whenever the spreadsheet is updated — no server required
4. This satisfies the "accommodate future data updates without a full rebuild" constraint: update xlsx → run script → push data.json → done
5. `data.json` is fetched at page load with a single `fetch('data/data.json')` call

### Visualizations Selected for Sprint 1 (from ST recommendations)

| # | Chart | Type | Data source | Priority |
|---|---|---|---|---|
| V1 | Total field samples, unique sites, active since, sequenced | KPI cards (4-up) | data.json kpis | BLOCKER |
| V2 | Samples collected per month | Line chart (Chart.js) | data.json temporal | HIGH |
| V3 | Sample type breakdown | Donut chart (Chart.js) | data.json sample_types | HIGH |
| V4 | Collection site map | Leaflet dot map | data.json sites | HIGH |
| V5 | Sample pipeline funnel | Horizontal bar chart (Chart.js) | data.json pipeline | NORMAL |
| V6 | Samples by collection site | Horizontal bar chart (Chart.js) | data.json by_site | NORMAL |
| V7 | Data explorer table | HTML table + JS filter | data.json recent_samples | NORMAL |

---

## Sprint 1 Task Packets (XML)

```xml
<task_decomposition task_id="broadn-p1-web-view" agent_count="2">
  <task_packets>

    <task_packet>
      <task_id>broadn-p1-data-prep</task_id>
      <assigned_to>Backend (BE#1)</assigned_to>
      <priority>BLOCKER</priority>
      <description>
        Write a Python preprocessing script that reads Bdb-317.xlsx and outputs data/data.json
        with pre-aggregated data for all dashboard visualizations, and data/sites.json with the
        authoritative geocoded collection site lookup table.

        INSPECTION FIRST: Before writing aggregation logic, run the existing inspection script
        (docs/analysis/inspect_bdb.py) against the actual xlsx file to confirm column names,
        data types, and fill rates. Document any column name deviations from BROADN_ID-protocol.md.

        SEQUENCING DETECTION LOGIC (critical): A sample is counted as sequenced if and only if
        the relevant sequencing column contains any non-empty, non-null text. That text is a
        filename or file path. Do NOT test for Y / yes / YES / 1 / True / boolean. Empty string
        or NaN = not sequenced. Identify which specific column(s) in the xlsx represent sequencing
        status during the inspection step and document them. Apply this logic to both
        pipeline.sequenced and kpis.sequenced_or_in_progress.

        SITE CODE PARSING (critical): The Originating Location column in the xlsx uses a 2-character
        composite code formed by concatenating the Collection Site letter and the Specific Site letter
        from BROADN_ID-protocol.md Appendix A. For example: S (SGRC) + E (East) = "SE" for SGRC-East;
        C (CPER) + E (East) = "CE" for CPER-East. The sites array in data.json MUST group by this
        2-char code, not the 1-char collection site code alone. During the inspection step, confirm
        that actual column values in the xlsx match this 2-char pattern. Document any deviations.
        Collapsing sub-sites to 1-char codes will produce incorrect counts and is not acceptable.

        GEOCODING — sites.json (one-time authored artifact): Create data/sites.json as an
        authoritative hard-coded lookup table. Do NOT generate it from the xlsx; site locations
        are fixed. Requirements:
          - All specific sub-sites listed in Appendix A of BROADN_ID-protocol.md must be present
            (approximately 25-30 total entries across all 12 parent collection sites).
          - Each entry must include: code (2-char composite), site_name (human-readable full name),
            collection_site (parent site abbreviation, e.g. SGRC), lat (float), lon (float),
            description (1-sentence plain English).
          - Coordinates must be accurate to at least 3 decimal places.
          - IMPROVE network sites (ACAD, EVER, GRCA, GRSM, HAVO, ROMO, OLYM, VOYA) must have
            correct, verified coordinates for the specific national park or monitoring area — do not
            use approximate center-of-state coordinates. Cross-reference with the BROADN Aerobiome
            Research Metadata Framework document for guidance on IMPROVE site identities.
          - The core CSU/CPER/NWT/SGRC sites must use coordinates from the Metadata Framework
            document, not approximated from city-level lookups.

        FILTER: All temporal, sample_types, by_site, and pipeline aggregations must be restricted
        to rows where Sample Category = "Field Sample". Derivatives are excluded from KPI counts
        and charts (except where noted in the data.json schema below).

        OUTPUT: Script must be idempotent. Re-running with the same xlsx produces identical output.
        Script prints a summary: row counts, fill rates for sequencing columns, any data quality
        warnings encountered.
      </description>
      <success_criteria>
        1. Script runs with `python3 scripts/preprocess_data.py` from project root with no errors.
        2. Output file data/data.json exists and is valid JSON.
        3. JSON contains all required top-level keys: meta, kpis, temporal, sample_types, pipeline,
           sites, by_site, recent_samples.
        4. meta.generated is an ISO-8601 timestamp.
        5. kpis.field_samples matches the actual count of rows where Sample Category = "Field Sample".
        6. temporal array contains one entry per year-month present in Date Created, field samples only.
        7. pipeline.sequenced is computed by counting rows where at least one sequencing column
           contains a non-empty, non-null string value (filename-based detection). Boolean or numeric
           parsing (Y/yes/1/True checks) is not used. This criterion is independently verifiable:
           the BE packet must state which column(s) were identified as sequencing columns and confirm
           the counting method used.
        8. data/sites.json exists and contains entries for all specific sub-sites (~25-30 total)
           per Appendix A of BROADN_ID-protocol.md.
        9. Every sites.json entry has a 2-char composite code, lat and lon accurate to at least
           3 decimal places, and a non-empty description field.
        10. IMPROVE network sites in sites.json have coordinates that correspond to the correct
            national park or monitoring area (not state-center approximations).
        11. Sites array in data.json groups by 2-char composite code (not 1-char collection site code).
            The packet must document the actual Originating Location column values found in xlsx and
            confirm they match or describe deviations.
        12. data.json sites array contains all collection sites with valid lat/lon sourced from sites.json.
        13. Script is idempotent.
        14. Script prints a summary including fill rates for sequencing columns.
        15. pipeline.collected >= pipeline.dna_extracted >= pipeline.sequenced (logical ordering holds).
      </success_criteria>
      <context_files>
        /home/jhber/projects/broadn-web-view/Bdb-317.xlsx
        /home/jhber/projects/broadn-web-view/BROADN_ID-protocol.md
        /home/jhber/projects/broadn-web-view/BROADN Aerobiome Research Metadata Framework.md
        /home/jhber/projects/broadn-web-view/.claude/agents/tasks/outputs/broadn-p1-web-view-consult-RA-1742169601.md
        /home/jhber/projects/broadn-web-view/.claude/agents/tasks/outputs/broadn-p1-web-view-consult-ST-1742169602.md
        /home/jhber/projects/broadn-web-view/docs/analysis/inspect_bdb.py
      </context_files>
      <dependencies>None — first task in sprint</dependencies>
      <out_of_scope>
        Do NOT write any HTML, CSS, or JavaScript.
        Do NOT modify the xlsx file.
        Do NOT implement authentication or API endpoints.
        Do NOT clean or normalize source data beyond what is needed for aggregation — document
          anomalies instead.
        Do NOT generate sites.json from the xlsx — it is a hand-authored artifact using known
          fixed locations.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>scripts/preprocess_data.py — the complete preprocessing script</item>
          <item>data/data.json — generated output, valid JSON, all 8 required top-level keys present</item>
          <item>data/sites.json — geocoding lookup with all ~25-30 specific sub-sites</item>
          <item>Written summary: actual xlsx column names found, fill rates for sequencing columns,
            sequencing column(s) identified, confirmation of 2-char site code pattern in data</item>
          <item>Explicit statement of which column(s) were used for sequencing detection and that
            filename-presence (not boolean/numeric) logic was applied</item>
        </must_contain>
        <must_not_contain>
          <item>HTML, JS, or CSS files</item>
          <item>Any modification to source xlsx</item>
          <item>Boolean/numeric sequencing detection (Y/yes/1/True) — this is a data quality error</item>
          <item>sites.json entries using state-center or city-level coordinates for IMPROVE sites</item>
        </must_not_contain>
        <success_signal>
          python3 scripts/preprocess_data.py runs to completion; data/data.json validates against
          required schema; packet explicitly documents sequencing column(s) and detection method;
          sites.json contains ~25-30 entries with 3-decimal-place coordinates; BE packet confirms
          2-char site codes are present in actual xlsx data.
        </success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>broadn-p1-fe-scaffold</task_id>
      <assigned_to>Frontend (FE#1)</assigned_to>
      <priority>HIGH</priority>
      <description>
        Build the complete index.html static page implementing the BROADN dashboard. Follows the
        UI design spec. Loads data/data.json via fetch. Implements all 7 visualizations + data table
        (V1–V7 as listed in the sprint plan). Uses vanilla JS only — no frameworks, no build step.

        COLOR RULES (read carefully — two separate rules apply):

        Rule A — Chart.js dataset configs: Raw hex and rgb color strings ARE permitted inside
        Chart.js dataset configuration objects (e.g., backgroundColor, borderColor properties
        within a Chart.js datasets array). Chart.js cannot consume Tailwind class names. This is
        the only location where raw hex/rgb values are allowed.

        Rule B — HTML badge and indicator colors: Do NOT use JS-generated inline style hex colors
        for table row badges, status indicators, or any visible HTML element. Instead, define a
        static JavaScript object (a "type-to-class map") that maps each possible sample type and
        site identifier to a complete, pre-written Tailwind class string. Example:
          const SAMPLE_TYPE_CLASSES = {
            'Air Filter': 'bg-blue-100 text-blue-800',
            'Soil':       'bg-yellow-100 text-yellow-800',
            'Plant':      'bg-green-100 text-green-800',
            'Water':      'bg-cyan-100 text-cyan-800',
            'Other':      'bg-stone-100 text-stone-700'
          };
        The full Tailwind class strings must be present as string literals in the source file so
        the Tailwind CDN scanner retains them. Do NOT construct partial class names dynamically
        (e.g., do NOT do 'bg-' + color + '-100' — the scanner will not see the full class name
        and it will not be generated). Define the complete class strings upfront and index into
        the map by type name.
      </description>
      <success_criteria>
        1. index.html opens in a browser (Chrome/Firefox) with no console errors.
        2. On load, fetches data/data.json and renders all charts without manual intervention.
        3. 4 KPI cards display correctly with values from kpis key.
        4. Line chart (temporal trend) renders with correct month labels and sample counts.
        5. Donut chart (sample types) renders with correct segments and legend.
        6. Leaflet map renders with one circle marker per sub-site, sized by sample count,
           tooltip on hover showing site name and count.
        7. Pipeline horizontal bar chart renders with 3 bars (collected, extracted, sequenced).
        8. Samples-by-site horizontal bar chart renders, sorted descending by count.
        9. Data explorer table renders with at minimum 20 rows from recent_samples; Category,
           Site, and Year filter dropdowns work.
        10. Loading skeleton state displays while data.json is fetching.
        11. Error state displays if data.json fetch fails (message + no broken chart containers).
        12. "Data updated" footer shows meta.generated formatted as human-readable date.
        13. All chart canvases have aria-label and role="img" attributes.
        14. All filter controls have associated label elements.
        15. Nav scroll-spy works (active class updates as user scrolls).
        16. Page is responsive at 375px, 768px, 1280px widths (KPI grid stacks to 2-col to 4-col).
        17. Design matches UI spec tokens: stone-50 background, green-800 accents, white cards
            with stone-200 border.
        18. Chart.js hex color values appear ONLY inside Chart.js dataset configuration objects.
            No raw hex values appear in HTML attributes or inline style strings for visible elements.
        19. Table row badge colors and status indicators use the static Tailwind class map pattern
            (full class name strings present in source as literals — no dynamic partial construction).
      </success_criteria>
      <context_files>
        /home/jhber/projects/broadn-web-view/Example-web-interface-fake-data.md
        /home/jhber/projects/broadn-web-view/.claude/agents/tasks/outputs/broadn-p1-web-view-consult-UI-1742169603.md
        /home/jhber/projects/broadn-web-view/.claude/agents/tasks/outputs/broadn-p1-web-view-consult-ST-1742169602.md
        /home/jhber/projects/broadn-web-view/BROADN_ID-protocol.md
      </context_files>
      <dependencies>broadn-p1-data-prep — data.json and sites.json must exist before FE can test
        against real data. FE may develop against a minimal mock data.json matching the schema for
        initial development, but MUST verify all 19 success criteria against the real data.json
        before marking complete.</dependencies>
      <out_of_scope>
        Do NOT implement a backend server or Node.js.
        Do NOT use React, Vue, or any JS framework — vanilla JS only.
        Do NOT implement the "Lab and Project Distribution" section — deferred to sprint 2.
        Do NOT implement user authentication.
        Do NOT implement the Export CSV feature — deferred to sprint 2.
        Do NOT use raw hex values in HTML attributes, inline style strings, or CSS for any
          visible element — hex is permitted only inside Chart.js dataset config objects.
        Do NOT construct partial Tailwind class names dynamically — full class strings must
          be present as literals in source.
        Do NOT modify data.json or the preprocessing script.
      </out_of_scope>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>index.html — complete self-contained file</item>
          <item>Screenshot or section-by-section description confirming each visualization renders</item>
          <item>Confirmation that the static SAMPLE_TYPE_CLASSES map (or equivalent named map)
            is present in source with full Tailwind class string literals</item>
          <item>Confirmation that hex values appear only inside Chart.js dataset config objects</item>
        </must_contain>
        <must_not_contain>
          <item>package.json, node_modules, or any build artifacts</item>
          <item>React, Vue, or framework component files</item>
          <item>Raw hex values in inline style attributes on HTML elements</item>
          <item>Dynamically constructed partial Tailwind class name strings</item>
        </must_not_contain>
        <success_signal>
          index.html opens locally in browser; all 7 visualizations render; no console errors;
          all 19 success criteria confirmed; auditor SA check will not flag hex colors in HTML
          because they are absent from HTML — only present in Chart.js config blocks.
        </success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    broadn-p1-data-prep → broadn-p1-fe-scaffold → AUDIT(broadn-p1-fe-audit) → ARCHIVE(broadn-p1-archive)

    Note: broadn-p1-data-prep produces both data/data.json and data/sites.json in a single pass.
    The separate broadn-p1-sites-geocoding task from the v1 MD has been merged into broadn-p1-data-prep
    to eliminate the XML/MD inconsistency identified by the Critic. There are now exactly 2 agent
    execution tasks in this sprint.
  </dependency_order>

  <routing_notes>
    1. broadn-p1-data-prep produces both the preprocessing script (data.json) and the geocoding lookup
       (sites.json) in a single BE agent pass. Do not route these as separate tasks.

    2. broadn-p1-fe-scaffold should be routed AFTER data.json and sites.json exist and have been
       confirmed valid. The Orchestrator should perform a receipt check on the BE packet before
       dispatching FE — specifically confirming: (a) sequencing detection method documented, (b)
       2-char site codes confirmed present in xlsx, (c) sites.json has ~25-30 entries.

    3. The audit gate (audit-pipeline skill) applies to the FE output. The Python preprocessing
       script is not subject to the SA/QA/SX frontend audit. A separate code review of the Python
       script is recommended but not blocking the FE audit gate.

    4. Human confirmation recommended before FE starts: actual xlsx column names (confirmed by BE
       running inspect_bdb.py) should be verified so the data.json schema can be adjusted if needed.
       The Orchestrator should route BE → confirm schema with human → then dispatch FE.

    5. The Lab and Project Distribution chart is confirmed deferred to sprint 2. The Orchestrator
       should surface this to the human so sprint 2 scope is acknowledged.

    6. Leaflet.js is the only new CDN dependency not in the prototype. All other libraries are
       directly from the prototype. No CDN load order issues anticipated beyond the existing
       window.onload pattern.
  </routing_notes>

  <risk_flags>
    1. xlsx column names differ from documented names — HIGH likelihood / MEDIUM impact. BE must
       run inspect_bdb.py on actual file; script must use explicit column name mapping with fallback
       detection. If column names deviate significantly, Orchestrator should surface to human before
       FE is dispatched.

    2. Lat/lon fill rate below 40% in raw xlsx — MEDIUM likelihood / LOW impact. Mitigation already
       in plan: use Originating Location site code + sites.json lookup; do NOT depend on per-sample
       raw coordinates for the map. This is resolved by design.

    3. Sequencing columns: confirmed by human to contain filename strings. Counting logic is
       filename-presence (non-empty text). BE must document which specific column(s) were identified
       during inspection. If no sequencing column can be identified in the xlsx, escalate to human.

    4. IMPROVE network sites create outlier map extent (national spread) — MEDIUM likelihood / LOW
       impact. UI spec recommends Colorado-focused default map view; IMPROVE sites shown with a
       distinct marker style or secondary tooltip layer. FE should handle gracefully.

    5. xlsx not parseable with openpyxl (password-protected or unusual format) — LOW likelihood /
       HIGH impact. BE should test parse immediately; if protected, escalate to human.

    6. data.json file size — recent_samples array capped at 100 most recent field samples to prevent
       browser payload bloat. Full data is not served to the browser.

    7. Tailwind CDN class purging — resolved in FE task by requiring full class string literals in
       the static type-to-class map. No dynamic partial class construction is permitted.
  </risk_flags>

</task_decomposition>
```

---

## Explicit Sprint 1 Out-of-Scope

The following are explicitly deferred to sprint 2 or later:

1. **Lab and Project Distribution section** — requires higher-quality Project ID / Lab column data (fill rate uncertain); defer until xlsx parse confirms coverage
2. **Export CSV button** — UX feature, not critical for v1 launch
3. **Faceted search / filter on charts** — complex interaction; v1 shows aggregate only
4. **Temporal slider / date range filter on charts** — defer to sprint 2
5. **Taxonomic plots** (bar plots, Sankey diagrams of community composition) — requires sequencing results data, not just sample metadata
6. **Workflow provenance diagrams** — requires bioinformatics pipeline data not in current xlsx
7. **TypeScript migration** — page is static HTML + vanilla JS; TypeScript adds build complexity without proportional benefit at this scale
8. **React SPA migration** — same rationale; defer indefinitely unless interactivity requirements grow substantially
9. **Server-side rendering or API** — no server exists; all logic is client-side and preprocessing script
10. **User accounts or authentication** — public-facing read-only dashboard

---

## data.json Required Shape

```json
{
  "meta": {
    "generated": "2026-03-17T00:00:00Z",
    "total_rows": 8000,
    "field_samples": 4200,
    "derivatives": 3800
  },
  "kpis": {
    "field_samples": 4200,
    "unique_sites": 28,
    "active_since": "2021",
    "sequenced_or_in_progress": 1850
  },
  "temporal": [
    { "month": "2021-09", "count": 45 }
  ],
  "sample_types": [
    { "type": "Air Filter", "count": 2100 },
    { "type": "Soil", "count": 850 }
  ],
  "pipeline": {
    "collected": 4200,
    "dna_extracted": 2800,
    "sequenced": 1850
  },
  "sites": [
    { "code": "CE", "name": "CPER — East", "lat": 40.832, "lon": -104.751, "count": 320, "primary_types": ["Air Filter", "Soil"] }
  ],
  "by_site": [
    { "site": "SGRC East", "code": "SE", "count": 580 }
  ],
  "recent_samples": [
    { "id": "BSE0042P", "date": "2024-05-10", "site": "SGRC", "type": "Plant", "category": "Field Sample" }
  ]
}
```

Note: `pipeline.sequenced` is derived by counting rows where at least one sequencing column contains
a non-empty, non-null string. `kpis.sequenced_or_in_progress` uses the same logic. Boolean parsing
is not used.

---

## Expectation Manifest

```xml
<expectation_manifest>
  <sprint_id>broadn-p1</sprint_id>
  <generated>2026-03-17T00:20:00Z</generated>
  <revision>v2</revision>
  <assignments>
    <assignment>
      <task_id>broadn-p1-data-prep</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p1-data-prep-BE-*.md</expected_file>
      <blocks>broadn-p1-fe-scaffold</blocks>
      <receipt_check>
        <item>scripts/preprocess_data.py exists and confirmed runnable</item>
        <item>data/data.json exists, is valid JSON, contains all 8 required top-level keys</item>
        <item>data/sites.json exists with entries for all ~25-30 specific sub-sites from Appendix A</item>
        <item>Packet explicitly names which xlsx column(s) were identified as sequencing columns</item>
        <item>Packet explicitly states that filename-presence (non-empty string) detection was used,
          not boolean/numeric parsing</item>
        <item>Packet documents actual xlsx column names found (confirms or corrects schema)</item>
        <item>Packet documents fill rates for sequencing columns</item>
        <item>Packet confirms that Originating Location column uses 2-char composite codes matching
          Appendix A, or documents deviations</item>
        <item>sites.json entries have lat/lon to at least 3 decimal places</item>
        <item>IMPROVE network sites in sites.json have recognizable national park coordinates
          (not state-center approximations)</item>
        <item>pipeline.collected >= pipeline.dna_extracted >= pipeline.sequenced (logical ordering)</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>broadn-p1-fe-scaffold</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p1-fe-scaffold-FE-*.md</expected_file>
      <blocks>broadn-p1-fe-audit</blocks>
      <receipt_check>
        <item>index.html exists and opens in browser with no console errors</item>
        <item>All 7 visualizations confirmed rendered (KPI cards, line, donut, map, pipeline bar,
          site bar, table)</item>
        <item>Leaflet map present with circle markers sized by sample count</item>
        <item>Loading state present (skeleton or spinner)</item>
        <item>Error state present for fetch failure</item>
        <item>All chart canvases have aria-label and role="img"</item>
        <item>Static type-to-class map confirmed present in source with full Tailwind class string
          literals (no partial dynamic construction)</item>
        <item>Raw hex values confirmed absent from HTML attributes and inline styles — present only
          in Chart.js dataset config objects</item>
        <item>No package.json, node_modules, or build artifacts</item>
        <item>Design tokens match spec: stone-50 bg, green-800 accent, white cards</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
```

---

*PM log: `/home/jhber/projects/broadn-web-view/docs/agent-logs/PM/broadn-p1-web-view.md`*
*Events: `/home/jhber/projects/broadn-web-view/docs/events/agent-events-2026-03-17.jsonl`*
*Task registry: `/home/jhber/projects/broadn-web-view/docs/task-registry.md`*
