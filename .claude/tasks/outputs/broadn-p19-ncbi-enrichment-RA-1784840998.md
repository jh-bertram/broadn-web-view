# RA#3 Output — BROADN site code → NCBI geo_loc_name resolution

Task: broadn-p19-ncbi-enrichment
Agent: RA#3
Generated: 2026-07-23

<research_dossier>
  <query>Resolve BROADN "Sample Collection Location" site codes to NCBI geo_loc_name strings ("Country: Region, locality"), one cited source per site-network identification.</query>
  <summary>All named site codes resolve to concrete US localities with cited sources: the four CSU/Colorado field sites (CPER, ARDEC, NWT, Foothills), the Big Spring TX site, the six IMPROVE national-park sub-sites (ACAD/EVER/GRCA/GRSM/HAVO/OLYM verified against the authoritative CIRA IMPROVE location table), and the two "Other" localities (South Carolina/Fierer and Doane University/Crete NE). The two previously-unknown codes were identified as real CSU facilities — SGRC = Semi-Arid Grasslands Research Center and PGF = CSU Plant Growth Facilities — both confirmed to be in Colorado by their institutional sources, so the state is evidence-backed, but the BROADN-code→facility mapping and the SGRC "East"/"Environment" sub-sites are inferences that should be PI-confirmed. "Unknown" (2 samples) has no locality string and is reported as an unresolved gap; no state was fabricated for any code.</summary>

  <findings>

    <!-- ============ 1. CPER ============ -->
    <point>
      <claim>CPER = Central Plains Experimental Range, USDA-ARS LTAR/NEON site, Weld County, ~7.5 mi (20 km) NE of Nunn, Colorado (40.83 N, 104.72 W). geo_loc_name: `USA: Colorado, Central Plains Experimental Range`</claim>
      <source>https://www.neonscience.org/field-sites/cper — and USDA-ARS: https://www.ars.usda.gov/plains-area/fort-collins-co/center-for-agricultural-resources-research/rangeland-resources-systems-research/</source>
      <relevance>Confirms Colorado/Weld County. 649 samples. Confidence: HIGH.</relevance>
    </point>

    <!-- ============ 2. ARDEC ============ -->
    <point>
      <claim>ARDEC = CSU Agricultural Research, Development & Education Center, 4616 NE Frontage Rd, ~4 mi N of Fort Collins, Colorado. geo_loc_name: `USA: Colorado, Fort Collins` (facility: ARDEC)</claim>
      <source>https://agsci.colostate.edu/research-and-engagement/research-centers/agricultural-research-development-and-education-center/about-ardec/</source>
      <relevance>Confirms Colorado / Fort Collins. 27 samples. Confidence: HIGH.</relevance>
    </point>

    <!-- ============ 3. NWT ============ -->
    <point>
      <claim>NWT = Niwot Ridge LTER, Front Range of the Rocky Mountains ~35 km W of Boulder, Boulder County, Colorado (40.05 N, 105.60 W; >3000 m elev). geo_loc_name: `USA: Colorado, Niwot Ridge`</claim>
      <source>https://lternet.edu/site/niwot-ridge-lter/ — and https://nwt.lternet.edu/explore-the-ridge</source>
      <relevance>Confirms Colorado (the only LTER site in Colorado). 48 samples. Confidence: HIGH.</relevance>
    </point>

    <!-- ============ 4. Foothills Campus ============ -->
    <point>
      <claim>Foothills Campus = CSU Foothills Campus, ~3 mi W of the CSU main campus at the base of Horsetooth Reservoir, Fort Collins, Colorado (research hub; houses CIRA). geo_loc_name: `USA: Colorado, Fort Collins` (facility: CSU Foothills Campus)</claim>
      <source>https://admissions.colostate.edu/about-csu/location/ — and https://www.cira.colostate.edu/welcome-about/map-directions/</source>
      <relevance>Confirms Colorado / Fort Collins. 74 samples. Confidence: HIGH.</relevance>
    </point>

    <!-- ============ 5. Big Spring, Texas ============ -->
    <point>
      <claim>Big Spring = city and county seat of Howard County, in southwest-central Texas (crossroads of I-20 / US-87). geo_loc_name: `USA: Texas, Big Spring`</claim>
      <source>https://en.wikipedia.org/wiki/Big_Spring,_Texas — and https://www.britannica.com/place/Big-Spring</source>
      <relevance>Confirms locality Big Spring, Howard County, Texas. 13 samples. Confidence: HIGH.</relevance>
    </point>

    <!-- ============ 6. IMPROVE sub-sites (verified against authoritative CIRA table) ============ -->
    <point>
      <claim>IMPROVE network sub-sites verified against the authoritative CIRA IMPROVE aerosol location table (code, full name, 2-letter state):
        - ACAD (ACAD1, ME 44.377/-68.261) → `USA: Maine, Acadia National Park`
        - EVER (EVER1, FL 25.391/-80.681) → `USA: Florida, Everglades National Park`
        - GRCA (GRCA1 "Hopi Point #1", AZ 36.066/-112.154) → `USA: Arizona, Grand Canyon National Park`
        - GRSM (GRSM1, TN 35.633/-83.942) → `USA: Tennessee, Great Smoky Mountains National Park`
        - HAVO (HAVO1, HI 19.431/-155.258) → `USA: Hawaii, Hawaii Volcanoes National Park`
        - OLYM (OLYM1, WA 48.007/-122.973) → `USA: Washington, Olympic National Park`</claim>
      <source>http://vista.cira.colostate.edu/DatawareHouse/IMPROVE/Data/AEROSOL/Help/IMPROVELocTable.txt (IMPROVE network aerosol site location table, CIRA/Colorado State University) — index: https://vista.cira.colostate.edu/Improve/</source>
      <relevance>The BROADN sub-site codes are the IMPROVE 4-letter park codes (the CIRA table appends a site index "1"). 1056 samples in the IMPROVE bucket. Confidence: HIGH. Note GRCA1 is the "Hopi Point" monitor inside Grand Canyon NP; GRSM straddles TN/NC but the GRSM1 monitor is on the Tennessee side.</relevance>
    </point>

    <!-- ============ 7. "Other" bucket ============ -->
    <point>
      <claim>"Other" bucket localities:
        (a) South Carolina — project "Fragmented Landscape" (PI Fierer; ~390 samples) is the experimentally-fragmented-landscape soil/air microbiome study in South Carolina (Winfrey, Resasco & Fierer 2025, Ecology). geo_loc_name: `USA: South Carolina`
        (b) Doane University — project "Algae Bloom" (PI Hancock) is Doane University, a private university in Crete, Nebraska. geo_loc_name: `USA: Nebraska, Crete`</claim>
      <source>South Carolina: https://www.fiererlab.org/publications — Doane: https://en.wikipedia.org/wiki/Doane_University_Osterhout_Arboretum and https://www.doane.edu/about-doane-university/our-campuses</source>
      <relevance>Confirms both localities inside the 635-sample "Other" bucket. Confidence: HIGH for both. (The SC fragmentation experiment is on the Savannah River Site landscape, but per task scope resolve to state only.)</relevance>
    </point>

    <!-- ============ 8. SGRC — state confirmed, facility mapping needs PI ============ -->
    <point>
      <claim>SGRC = Semi-Arid Grasslands Research Center — a Colorado State University + USDA-ARS partnership facility in northern Colorado ("near Fort Collins, Greeley, Denver, and Cheyenne … Chalk Bluffs and Wyoming to the north, Rocky Mountains to the west"). STATE resolved: `USA: Colorado`. Best geo_loc_name: `USA: Colorado, Semi-Arid Grasslands Research Center` — see PI-confirmation flag below.</claim>
      <source>https://sgrc.colostate.edu/ — and https://sgrc.colostate.edu/about</source>
      <relevance>1982 samples (the largest single bucket). The acronym expands unambiguously to a real CSU/USDA-ARS facility in the same institutional context as BROADN (CSU aerobiome / Borlee Lab), and its own site places it in northern Colorado — so Country+State (USA: Colorado) is evidence-backed, NOT a guess. UNCONFIRMED: (i) that BROADN's "SGRC" code = this specific facility (acronym+institution match, not a primary-source BROADN mapping); (ii) the exact locality/county — the SGRC "about" page did not state a county or town; and (iii) the meaning of the sub-site codes "East" and "Environment". Confidence: HIGH on state, MEDIUM on exact facility/locality. ACTION: PI confirm the SGRC facility identity, its precise site (likely co-located on the shortgrass steppe near the CPER/Nunn, Weld County — plausible but not sourced here), and the sub-site semantics before finalizing the locality field.</relevance>
    </point>

    <!-- ============ 9. PGF — state confirmed, facility mapping needs PI ============ -->
    <point>
      <claim>PGF = CSU Plant Growth Facilities — an Institutional Core Research Facility (60,000+ sq ft of greenhouses, growth/biocontainment chambers, conservatory), 1241 Libbie Coy Way, Fort Collins, Colorado. STATE resolved: `USA: Colorado`. Best geo_loc_name: `USA: Colorado, Fort Collins` (facility: CSU Plant Growth Facilities / greenhouse) — see PI flag below.</claim>
      <source>https://agsci.colostate.edu/research-and-engagement/research-centers/plant-growth-facilities/about-pgf/ — and https://webdoc.agsci.colostate.edu/pgf/CSU%20Plant%20Growth%20Facilities_FY19.pdf</source>
      <relevance>8 samples. "PGF" is the exact CSU-internal acronym for the Plant Growth Facilities greenhouse on the CSU campus in Fort Collins — matching the task's "Plant Growth Facility/greenhouse" hypothesis and the BROADN institutional context. Country+State (USA: Colorado) is evidence-backed. UNCONFIRMED: that BROADN's "PGF" code specifically = this facility (acronym+institution match). Confidence: HIGH on state, MEDIUM on facility mapping. ACTION: light PI confirmation that "PGF" refers to the CSU Plant Growth Facilities.</relevance>
    </point>

    <!-- ============ 10. Unknown ============ -->
    <point>
      <claim>"Unknown" (2 samples) — no location string; cannot be resolved. geo_loc_name: leave BLANK (or NCBI-permitted `missing` / `not collected` per submission policy). Reported as a data gap.</claim>
      <source>N/A — no source exists; this is a genuine gap in the source data.</source>
      <relevance>2 samples. UNRESOLVED. Do not assign any country/state. ACTION: PI to supply the collection location, or submit with an INSDC missing-value term.</relevance>
    </point>

  </findings>

  <conflicting_data>
    No source conflicts encountered. One boundary note (not a conflict): Great Smoky Mountains NP spans Tennessee and North Carolina; the CIRA IMPROVE record for GRSM1 (35.633 N, -83.942 W) places the monitor on the Tennessee side, so `USA: Tennessee, Great Smoky Mountains National Park` is used. If the PI prefers the park-spanning form, `USA: Tennessee, Great Smoky Mountains National Park` remains the geographically-correct monitor location.
  </conflicting_data>

  <staleness_risk>
    - IMPROVE/CIRA location table (vista.cira.colostate.edu) is periodically re-versioned and some legacy `vista.*` paths redirect to `views.cira.colostate.edu`; the code→park→state mapping for these long-running sites is stable, but re-verify the URL is live before shipping the submission.
    - SGRC and PGF resolutions rely on acronym+institution matching, not a primary BROADN site registry. If BROADN publishes an internal site dictionary, prefer it over this inference. These two codes (and Unknown) are the items most likely to change on PI review.
  </staleness_risk>
</research_dossier>

---

## Quick-reference table (for the enrichment writer)

| BROADN code (sub-site) | count | geo_loc_name | source (short) | confidence |
|---|---|---|---|---|
| CPER | 649 | `USA: Colorado, Central Plains Experimental Range` | NEON / USDA-ARS | HIGH |
| ARDEC | 27 | `USA: Colorado, Fort Collins` | agsci.colostate.edu | HIGH |
| NWT | 48 | `USA: Colorado, Niwot Ridge` | lternet.edu | HIGH |
| Foothills Campus | 74 | `USA: Colorado, Fort Collins` | admissions.colostate.edu / CIRA | HIGH |
| Big Spring, Texas | 13 | `USA: Texas, Big Spring` | Wikipedia / Britannica | HIGH |
| IMPROVE / ACAD | (1056 bucket) | `USA: Maine, Acadia National Park` | CIRA IMPROVELocTable | HIGH |
| IMPROVE / EVER | | `USA: Florida, Everglades National Park` | CIRA IMPROVELocTable | HIGH |
| IMPROVE / GRCA | | `USA: Arizona, Grand Canyon National Park` | CIRA IMPROVELocTable | HIGH |
| IMPROVE / GRSM | | `USA: Tennessee, Great Smoky Mountains National Park` | CIRA IMPROVELocTable | HIGH |
| IMPROVE / HAVO | | `USA: Hawaii, Hawaii Volcanoes National Park` | CIRA IMPROVELocTable | HIGH |
| IMPROVE / OLYM | | `USA: Washington, Olympic National Park` | CIRA IMPROVELocTable | HIGH |
| Other / South Carolina | ~390 | `USA: South Carolina` | fiererlab.org | HIGH |
| Other / Doane University | (Other 635 bucket) | `USA: Nebraska, Crete` | doane.edu / Wikipedia | HIGH |
| SGRC (East, Environment) | 1982 | `USA: Colorado, Semi-Arid Grasslands Research Center` | sgrc.colostate.edu | STATE HIGH / facility MEDIUM — **PI-confirm** |
| PGF | 8 | `USA: Colorado, Fort Collins` (CSU Plant Growth Facilities) | agsci.colostate.edu | STATE HIGH / mapping MEDIUM — **PI-confirm** |
| Unknown | 2 | (blank / INSDC missing-value) | — | UNRESOLVED — gap |

## Items requiring PI confirmation (do not finalize without)
1. **SGRC** — confirm BROADN "SGRC" = Semi-Arid Grasslands Research Center; supply exact site/county (hypothesis: shortgrass steppe near CPER/Nunn, Weld County — plausible, unsourced) and the meaning of sub-sites "East" and "Environment". State (Colorado) is safe.
2. **PGF** — confirm BROADN "PGF" = CSU Plant Growth Facilities (Fort Collins greenhouse). State (Colorado) is safe.
3. **Unknown (2 samples)** — no location; PI must supply or submit with an INSDC missing-value term. No state fabricated.
