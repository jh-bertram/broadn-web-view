// BROADN dashboard app — extracted from index.html main <script> block (complexity-review step 0b).
    // =============================================================================
    // CONSTANTS — design tokens and static maps
    // =============================================================================

    // Rule B: Static Tailwind class map for sample type badges.
    // Full class string literals only — no dynamic partial construction.
    const SAMPLE_TYPE_CLASSES = {
      'Air':     'bg-green-100 text-green-800',
      'Plant':   'bg-emerald-100 text-emerald-800',
      'Soil':    'bg-amber-100 text-amber-800',
      'Liquid':  'bg-blue-100 text-blue-800',
      'Unknown': 'bg-stone-100 text-stone-600'
    };

    const CATEGORY_CLASSES = {
      'Field Sample': 'bg-green-100 text-green-800',
      'Derivative':   'bg-purple-100 text-purple-800',
      'Other':        'bg-stone-100 text-stone-600'
    };

    const PAGE_SIZE = 100;
    var tableCurrentPage = 1;

    // SAMPLE_TYPE_COLORS — SINGLE SOURCE OF TRUTH for all sample-type category color encodings.
    // Keyed by category NAME (not array index). Okabe-Ito colorblind-safe palette.
    // ALL sample-type charts (global donut, slice donut, PG timeline, PG cadence fallback, static HTML
    // legend) derive colors from this object. Brand teal (#0c5454/#0c9cb4) is NOT a member — brand ≠ data.
    // See DESIGN.md § Sample-Type Data Palette (v2).
    const SAMPLE_TYPE_COLORS = {
      'Air':     '#0072B2',  // Okabe-Ito blue
      'Plant':   '#009E73',  // Okabe-Ito teal-green
      'Soil':    '#E69F00',  // Okabe-Ito amber
      'Liquid':  '#56B4E9',  // Okabe-Ito sky blue
      'Unknown': '#999999'   // neutral gray fallback
    };

    // Rule A: Chart.js and Leaflet hex values — permitted ONLY inside dataset/marker
    // configuration objects (Chart.js datasets arrays, Leaflet circleMarker options).
    const CHART_COLORS = {
      line:             '#0c5454',              // deep teal (v2 brand; was CSU green)
      lineArea:         'rgba(12,84,84,0.1)',   // derived from deep teal
      tooltip:          'rgba(28,25,23,0.9)',
      gridLine:         '#e7e5e4',
      axisLabel:        '#78716c',
      donutBorder:      '#ffffff',
      // Pipeline: navy→teal sequential — all steps ≥3:1 non-text contrast on white (DESIGN.md § Pipeline)
      pipeline:         ['#1e3a5f', '#2b6c8a', '#4db6c4'],
      // sampleTypes array RETIRED — use SAMPLE_TYPE_COLORS keyed by name (see above)
      siteBar:          '#0c5454',              // deep teal (was #15803d)
      pointBg:          '#0c5454',              // deep teal (v2 brand)
      mapMarkerFill:    '#0c5454',              // deep teal (v2 brand)
      mapMarkerBorder:  '#083838',              // dark teal (was #14532d)
      // Slice panel chart colors — Section 7 of design spec
      // sliceSampleTypes array RETIRED — use SAMPLE_TYPE_COLORS keyed by name (see above)
      slicePipeline:     ['#1e3a5f', '#0f766e', '#6d28d9'],  // [0] deep navy pipeline-collected (v2)
      sliceTemporalLine: '#0f766e',
      sliceTemporalArea: 'rgba(15,118,110,0.1)',
      /* TEMPORAL BAR COLOR — edit CHART_COLORS.temporalBar to change global temporal bar fill */
      temporalBar:       '#0c5454',              // deep teal (v2 brand)
      /* SLICE TEMPORAL BAR COLOR — edit CHART_COLORS.sliceTemporalBar to change slice temporal bar fill */
      sliceTemporalBar:  '#0f766e',
      sliceLocationBar:  '#0369a1',
      sliceTimeOfDay:    ['#0c5454', '#0f766e', '#b45309', '#6d28d9'],  // [0] deep teal (v2)
      /* HEAT-STRIP RAMP — pale→deep teal by % sequenced (quadrant matrix) */
      sliceHeatRamp:     ['#f0fdf4', '#bbf7d0', '#15803d', '#064e3b'],  // [3] emerald-900 dark end (v2)
      // FILTER ACCENT — wired to --color-filter-accent (#c2410c). See DESIGN.md § Orange Consolidation.
      orangeAccent:      '#c2410c',              // matches --color-filter-accent (v2 orange consolidation)
      orangeAccentDim:   'rgba(194,65,12,0.3)', // derived from #c2410c
      // samplerType array RETIRED — use SAMPLE_TYPE_COLORS values as generic categorical pool (see below)
    };

    const MAP_CENTER_DEFAULT = [39.5, -98.35];
    const MAP_ZOOM_DEFAULT   = 4;

    // =============================================================================
    // CHART.JS GLOBAL DEFAULTS (set before any new Chart() call)
    // =============================================================================
    // Inter font stack — matches DESIGN.md § Typography and body font in styles.css
    Chart.defaults.font.family = '"Inter", system-ui, -apple-system, Helvetica, Arial, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = '#57534e'; // --color-text-secondary

    // =============================================================================
    // SLICE PANEL CONSTANTS
    // =============================================================================

    // Single source of truth for category label strings.
    // All button labels, state comparisons, and renderView() dispatch branches
    // MUST reference this constant — no inline string duplicates elsewhere.
    const SLICE_CATEGORIES = {
      ALL:       null,          // sentinel: "All BROADN Samples" — filterState.slice.category === null
      PROJECT:   'Project',
      LOCATION:  'Location / Hub',
      LAB_GROUP: 'Lab Group'
    };

    // Tag badge CSS classes — full static strings required for Tailwind scanning
    const TAG_BADGE_CLASSES = {
      active:   'px-2 py-1 text-xs font-semibold cursor-pointer bg-orange-700 text-white',
      inactive: 'px-2 py-1 text-xs font-semibold cursor-pointer bg-stone-700 text-stone-200 hover:bg-stone-600'
    };

    // =============================================================================
    // STATE
    // =============================================================================
    let appData = null;
    let chartInstances = {};

    // Phase 2 — declarative slice rendering (complexity review)
    let projectLayouts = null;        // parsed data/project-layouts.json; null => legacy renderer fallback
    let layoutOverrides = null;       // parsed data/layout-overrides.json; null => no hand-authored overrides
    let dynamicSliceChartIds = [];    // chart ids renderSlice created this pass (torn down on next renderView)
    const USE_RENDER_SLICE = true;    // feature flag — flip to false for instant rollback to legacy renderProjectView

    // Phase 3 — designer mode. Gated by an EXACT ?design token; completely inert/absent for normal visitors.
    var DESIGN_MODE = (typeof window !== 'undefined') && new URLSearchParams(window.location.search).has('design');
    var editorState = { activeSlice: null, working: {}, removed: {} };

    // Filter state — slice + tag dimensions; replaces former sliceState
    const filterState = {
      slice: {
        category: null,  // null | SLICE_CATEGORIES.PROJECT | SLICE_CATEGORIES.LOCATION | SLICE_CATEGORIES.LAB_GROUP
        group:    null   // null | string (project_id / site_code / group_name)
      },
      tags: []  // array of active tag token strings
    };

    // Global tag dict — populated in initDashboard, accessible to clearSliceFilter
    // Structure: { colLabel: { token: count } } — mirrors slice entry tag_groups format.
    var globalTagsDict = {};

    // Project descriptions for the project-context banner (Feature 6)
    const PROJECT_DESCRIPTIONS = {
      "IMPROVE Fungi":         "Analyzes archived samples from seven national park monitoring sites to study fungal and pollen aerobiome patterns across the United States.",
      "Fragmented Landscape":  "Examines whether vegetation affects airborne microbe variety and identifies which organisms are suited to airborne dispersal.",
      "2023 Two Towers":       "Compares airborne microbial communities between grassland and forest environments at different heights and times across seasons.",
      "Ice-Nucleating Particles": "Studies ice-nucleating particles (INPs) released during rainfall events from local plant sources and their role in cloud ice formation.",
      "Flux":                  "Measures bioaerosol movement over grasslands using flux gradient techniques to determine whether particles originate locally or from distant sources.",
      "CPER":                  "Cross-project program of concurrent field campaigns at CPER and SGRC, 2022–2023. Click sub-projects below to drill into individual campaigns.",
      "2022 Fall CPER":        "Field sampling campaign at the Central Plains Experimental Range — fall 2022 collection.",
      "Spring Chemistry":      "Spring CPER campaign with chemistry analysis component (consolidated from prior 2023 sub-project).",
      "2022 Fall CPER FC":     "Fall 2022 CPER fractional collection variant.",
      "Spring SASS/Polycarbonate Top/Bottom": "Performance evaluation of bioaerosol samplers comparing SASS and polycarbonate filter configurations in field conditions.",
      "Spring Sass/VIVAS":     "Comparative evaluation of SASS and VIVAS bioaerosol sampler performance.",
      "Optimization Tests":    "Sampler optimization and pipeline development tests.",
      "Spring SKC":            "Spring field collection using SKC sampler configuration.",
    };

    // Rich per-project page content (bucket B). Keyed by project_id (matches
    // slice_views.project[].project_id). Sourced from the BROADN site
    // (broadn.colostate.edu/projects) + the project's data accession. Projects
    // absent here fall back to the short PROJECT_DESCRIPTIONS blurb and render
    // no people/links row. Add entries incrementally as content is gathered.
    // Shared lead references (DRY — reused across projects). Bio URLs from the
    // BROADN team page; leads without a confirmed bio page carry no url and
    // render as plain text.
    const LEAD = {
      fierer:      { name: "Noah Fierer",       affiliation: "CU Boulder", url: "https://broadn.colostate.edu/noah-fierer-bio/" },
      kreidenweis: { name: "Sonia Kreidenweis", affiliation: "CSU",        url: "https://broadn.colostate.edu/sonia-kreidenweis-bio/" },
      trivedi:     { name: "Pankaj Trivedi",    affiliation: "CSU",        url: "https://broadn.colostate.edu/pankaj-trivedi-bio/" },
      stewart:     { name: "Jane Stewart",      affiliation: "CSU",        url: "https://broadn.colostate.edu/jane-e-stewart-bio/" },
      borlee:      { name: "Brad Borlee",       affiliation: "CSU",        url: "https://broadn.colostate.edu/brad-borlee-bio/" },
      farmer:      { name: "Delphine Farmer",   affiliation: "CSU" },
      mignani:     { name: "Claudia Mignani" }
    };
    const PROJECTS_PAGE = { label: "Project page — BROADN", url: "https://broadn.colostate.edu/projects/" };

    const PROJECT_CONTENT = {
      "IMPROVE Fungi": {
        location: "U.S. national parks (IMPROVE network)",
        summary: "Part of “Aerobiomes of America” — analyzes archived filter samples from seven IMPROVE air-quality monitoring sites in U.S. national parks to map fungal aerobiome patterns nationwide and explore how local conditions and dust-storm events shape them.",
        lead: LEAD.fierer,
        coInvestigators: ["Sarah Gering", "Marina Nieto-Caballero", "Scott Copeland", "Sonia Kreidenweis"],
        links: [PROJECTS_PAGE]
      },
      "Fragmented Landscape": {
        location: "South Carolina",
        summary: "Investigates the sources and spatial patterns of the air microbiome across a fragmented southeastern landscape. Early findings indicate vegetation type has little effect on which microbes are airborne — but leaves release more bacteria and fungi than soil, and spore-forming bacteria are the most likely to become airborne.",
        lead: LEAD.fierer,
        coInvestigators: ["Claire Winfrey", "Julian Resasco", "Jane Stewart"],
        links: [
          { label: "Sequence data — NCBI PRJNA1263026", url: "https://www.ncbi.nlm.nih.gov/bioproject/?term=PRJNA1263026" },
          PROJECTS_PAGE
        ]
      },
      "Two Towers": {
        location: "Grassland & forest, Colorado",
        summary: "Collected air samples from grassland and forest sites using two sampling towers across spring, summer, and fall 2023 to understand how habitat and season shape airborne microbial communities.",
        lead: LEAD.stewart,
        coInvestigators: ["Carolyn Cornell", "Ashley Miller", "Marina Nieto-Caballero", "Zaid Abdo", "Jessica Metcalf"],
        links: [
          { label: "Cornell et al. 2026, mBio", url: "https://doi.org/10.1128/mbio.03057-25" },
          PROJECTS_PAGE
        ]
      },
      "Flux": {
        location: "Grasslands (CPER), Colorado",
        summary: "Develops surface-atmosphere flux measurements of total DNA and other bioaerosol markers, using a flux-gradient approach at multiple heights over grasslands to determine whether airborne particles originate locally or from distant sources.",
        lead: LEAD.farmer,
        coInvestigators: ["Sonia Kreidenweis", "Jay Ham", "Lily Jones"],
        links: [PROJECTS_PAGE]
      },
      "Ice-Nucleating Particles": {
        location: "Grassland, Colorado",
        summary: "Found that the amount of ice-nucleating particles (INPs) in the air increases with the energy and amount of rainfall, suggesting precipitation releases INPs from local plant sources — with implications for cloud-ice formation.",
        lead: LEAD.mignani,
        coInvestigators: ["Sonia Kreidenweis", "Thomas Hill", "Marina Nieto-Caballero", "Kevin Barry"],
        links: [
          { label: "Mignani et al. 2025, JGR Atmospheres", url: "https://doi.org/10.1029/2024JD042584" },
          PROJECTS_PAGE
        ]
      },
      "Fall Plant Circle": {
        location: "Central Plains Experimental Range (CPER), Colorado",
        summary: "Part of the central-grasslands aerobiome study, sampling grassland air during the fall 2022 season. Findings indicate soil bacteria are more closely connected to the air microbiome than fungi are.",
        lead: LEAD.trivedi,
        coInvestigators: ["Jan Leach", "Marina Nieto-Caballero", "Avinash Dhar", "Sonia Kreidenweis", "Kris Otto"],
        links: [PROJECTS_PAGE]
      },
      "Spring Plant Circle": {
        location: "Central Plains Experimental Range (CPER), Colorado",
        summary: "Part of the central-grasslands aerobiome study, sampling grassland air during the spring 2023 season to characterize how microbial communities shift with season and environmental conditions.",
        lead: LEAD.trivedi,
        coInvestigators: ["Jan Leach", "Marina Nieto-Caballero", "Avinash Dhar", "Sonia Kreidenweis", "Kris Otto"],
        links: [PROJECTS_PAGE]
      },
      "Fall Plants & Soil": {
        location: "Central Plains Experimental Range (CPER), Colorado",
        summary: "Paired air, plant, and soil sampling in the central grasslands to trace how much of the grassland aerobiome originates from local soil and vegetation sources.",
        lead: LEAD.trivedi,
        coInvestigators: ["Jan Leach", "Marina Nieto-Caballero", "Avinash Dhar"],
        links: [PROJECTS_PAGE]
      },
      "Spring Plants & Soil": {
        location: "Central Plains Experimental Range (CPER), Colorado",
        summary: "Uses shotgun metagenomics on samples from the spring 2023 CPER campaign to understand how humidity, sunlight, and altitude affect the diversity and functions of grassland air microbes.",
        lead: LEAD.trivedi,
        coInvestigators: ["Jan Leach", "Marina Nieto-Caballero", "Avinash Dhar", "Rocio Rodriguez de las Llagas"],
        links: [PROJECTS_PAGE]
      },
      "BACS": {
        location: "CPER / convective storms, Colorado",
        summary: "The BioAerosols and Convective Storms (BACS) field campaigns examine variability in cold-pool characteristics and how aerosols — including bioaerosols — respond to convective storm activity.",
        lead: LEAD.kreidenweis,
        coInvestigators: ["Paul DeMott"],
        links: [
          { label: "Ascher et al. 2026, BAMS", url: "https://doi.org/10.1175/BAMS-D-25-0105.1" },
          PROJECTS_PAGE
        ]
      },
      "Spring SASS/Polycarbonate Top/Bottom": {
        location: "Central Plains Experimental Range (CPER), Colorado",
        summary: "Field performance evaluation of bioaerosol samplers, comparing SASS and polycarbonate top/bottom filter configurations to help standardize collection techniques.",
        lead: LEAD.kreidenweis,
        coInvestigators: ["Marina Nieto-Caballero", "Kevin Barry"],
        links: [PROJECTS_PAGE]
      },
      "Spring Sass/VIVAS": {
        location: "Central Plains Experimental Range (CPER), Colorado",
        summary: "Comparative field evaluation of SASS and VIVAS bioaerosol sampler performance under matched conditions.",
        lead: LEAD.kreidenweis,
        coInvestigators: ["Marina Nieto-Caballero", "Kevin Barry"],
        links: [PROJECTS_PAGE]
      },
      "Spring Chemistry": {
        location: "Central Plains Experimental Range (CPER), Colorado",
        summary: "Spring CPER campaign with an added chemistry-analysis component characterizing the chemical context of collected aerobiome samples.",
        lead: LEAD.kreidenweis
      },
      "2022 Fall CPER": {
        location: "Central Plains Experimental Range (CPER), Colorado",
        summary: "Field sampling campaign at the Central Plains Experimental Range — the fall 2022 grassland aerobiome collection.",
        lead: LEAD.kreidenweis
      },
      "2022 Fall CPER FC": {
        location: "Central Plains Experimental Range (CPER), Colorado",
        summary: "Fall 2022 CPER field-control collection variant, providing blanks and controls for the main campaign.",
        lead: LEAD.kreidenweis
      },
      "2022 Fall CPER Extra": {
        location: "Central Plains Experimental Range (CPER), Colorado",
        summary: "Supplementary fall 2022 CPER collection capturing additional samples beyond the core campaign.",
        lead: LEAD.kreidenweis
      },
      "Optimization Tests": {
        summary: "Sampler optimization and pipeline-development tests used to refine collection and processing methods.",
        lead: LEAD.kreidenweis
      },
      "Spring SKC": {
        location: "Central Plains Experimental Range (CPER), Colorado",
        summary: "Spring field collection using the SKC sampler configuration.",
        lead: LEAD.trivedi
      },
      "ARDEC Pilot Study": {
        location: "ARDEC, Fort Collins, Colorado",
        summary: "Early pilot collection at the Agricultural Research, Development and Education Center (ARDEC) to characterize the background aerobiome before exposure to agricultural activity.",
        lead: LEAD.kreidenweis
      },
      "2024 Summer": {
        location: "SGRC, Southern Great Plains",
        summary: "Summer 2024 aerobiome collection at the SGRC site, extending the program's spatial coverage into the southern Great Plains.",
        lead: LEAD.borlee
      }
    };

    // Returns true when any filter dimension is active
    function isFilterActive() {
      return filterState.slice.category !== null || filterState.tags.length > 0;
    }

    // Clears only tag filters and re-applies. Does NOT touch slice.category or slice.group.
    function clearAllTags() {
      filterState.tags = [];
      applyFilter(filterState);
    }

    // Shows or hides the tag filter banner based on filterState.tags.
    // Repopulates pills using TAG_BADGE_CLASSES.active. No new state variables.
    function updateTagBanner() {
      var banner = document.getElementById('tag-filter-banner');
      if (!banner) return;
      var tags = filterState.tags;
      if (tags.length > 0) {
        var pillsContainer = banner.querySelector('.tag-banner-pills');
        pillsContainer.innerHTML = '';
        tags.forEach(function(tag) {
          var pill = document.createElement('span');
          pill.className = TAG_BADGE_CLASSES.active + ' pointer-events-none';
          pill.textContent = tag;
          pillsContainer.appendChild(pill);
        });
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    }

    // Shared publication/data link chip — used by the banner AND the link_chip slice widget (DRY).
    function makeLinkChip(lk) {
      var a = document.createElement('a');
      a.href = lk.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'inline-flex items-center gap-1 rounded-md border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-medium px-3 py-1.5';
      a.textContent = lk.label;
      var arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.className = 'text-stone-400';
      arrow.textContent = '↗';
      a.appendChild(arrow);
      return a;
    }

    // Shows or hides the project-context banner based on filterState.slice.
    // Only visible when category === PROJECT and a group is selected.
    function updateProjectBanner() {
      var banner = document.getElementById('project-banner');
      if (!banner) return;
      var cat = filterState.slice.category;
      var group = filterState.slice.group;
      var locEl    = banner.querySelector('.project-banner-location');
      var peopleEl = banner.querySelector('.project-banner-people');
      var linksEl  = banner.querySelector('.project-banner-links');

      if (cat === SLICE_CATEGORIES.PROJECT && group) {
        var content = PROJECT_CONTENT[group];
        banner.querySelector('.project-banner-name').textContent = group;

        // Description: prefer rich summary, then short blurb, then generic fallback
        banner.querySelector('.project-banner-desc').textContent =
          (content && content.summary) || PROJECT_DESCRIPTIONS[group] ||
          'Description not yet available — contact the project team.';

        // Location chip
        if (content && content.location) {
          locEl.textContent = content.location;
          locEl.classList.remove('hidden');
        } else {
          locEl.classList.add('hidden');
        }

        // People line: lead (linked to bio) + co-investigators
        peopleEl.innerHTML = '';
        if (content && content.lead) {
          var leadLabel = document.createElement('span');
          leadLabel.className = 'font-semibold text-stone-500';
          leadLabel.textContent = 'Lead: ';
          peopleEl.appendChild(leadLabel);

          var leadNode;
          if (content.lead.url) {
            leadNode = document.createElement('a');
            leadNode.href = content.lead.url;
            leadNode.target = '_blank';
            leadNode.rel = 'noopener noreferrer';
            leadNode.className = 'text-green-800 font-medium hover:text-green-700 underline underline-offset-2';
          } else {
            leadNode = document.createElement('span');
            leadNode.className = 'text-stone-800 font-medium';
          }
          leadNode.textContent = content.lead.name +
            (content.lead.affiliation ? ' (' + content.lead.affiliation + ')' : '');
          peopleEl.appendChild(leadNode);

          if (content.coInvestigators && content.coInvestigators.length) {
            var coNode = document.createElement('span');
            coNode.className = 'text-stone-500';
            coNode.textContent = '  ·  with ' + content.coInvestigators.join(', ');
            peopleEl.appendChild(coNode);
          }
          peopleEl.classList.remove('hidden');
        } else {
          peopleEl.classList.add('hidden');
        }

        // Links: publications / data accessions (open in a new tab). When the active project's
        // layout owns these via a link_chip widget, the banner yields (link_chip draws them in-grid).
        linksEl.innerHTML = '';
        var resolvedLayout = getLayoutFor('project', { project_id: group });   // override-aware resolver
        var linksOwnedByWidget = USE_RENDER_SLICE && resolvedLayout &&
          resolvedLayout.widgets.some(function(w) { return w.type === 'link_chip'; });
        if (!linksOwnedByWidget && content && content.links && content.links.length) {
          content.links.forEach(function(lk) { linksEl.appendChild(makeLinkChip(lk)); });
          linksEl.classList.remove('hidden');
        } else {
          linksEl.classList.add('hidden');
        }

        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    }

    /**
     * getFilteredCount(entry, activeTags)
     * Returns the effective sample count for a slice entry given active tag filters.
     *
     * If activeTags is empty OR entry.tag_groups is empty/absent:
     *   return entry.sample_count (unfiltered)
     *
     * Otherwise:
     *   Searches each column group in tag_groups for selected tokens.
     *   Returns sum of matched token counts (union approximation — counts may overlap).
     *   If no selected tokens exist in tag_groups, return 0.
     */
    function getFilteredCount(entry, activeTags) {
      if (!activeTags || activeTags.length === 0) {
        return entry.sample_count;
      }
      var tg = entry.tag_groups;
      if (!tg || typeof tg !== 'object' || Object.keys(tg).length === 0) {
        return entry.sample_count;
      }
      var total = 0;
      var found = false;
      var colLabels = Object.keys(tg);
      for (var c = 0; c < colLabels.length; c++) {
        var tokenCounts = tg[colLabels[c]];
        if (!tokenCounts || typeof tokenCounts !== 'object') continue;
        for (var i = 0; i < activeTags.length; i++) {
          var token = activeTags[i];
          if (Object.prototype.hasOwnProperty.call(tokenCounts, token) && typeof tokenCounts[token] === 'number') {
            total += tokenCounts[token];
            found = true;
          }
        }
      }
      return found ? total : 0;
    }

    // Return the slice entry for the currently-selected group, or null.
    function getSliceEntry(category, groupId) {
      if (!appData || !appData.slice_views) return null;
      if (category === SLICE_CATEGORIES.PROJECT) {
        return (appData.slice_views.project || []).find(function(e) { return e.project_id === groupId; }) || null;
      }
      if (category === SLICE_CATEGORIES.LOCATION) {
        return (appData.slice_views.location || []).find(function(e) { return e.site_code === groupId; }) || null;
      }
      if (category === SLICE_CATEGORIES.LAB_GROUP) {
        return (appData.slice_views.lab_group || []).find(function(e) { return e.group_name === groupId; }) || null;
      }
      return null;
    }

    // Merge per-token chart data from tag_charts for a set of active tags (union).
    // Returns { temporal, sample_types, pipeline, sampler_type_dist } or null if
    // none of the active tags exist in tagCharts.
    function mergeTagChartData(tagCharts, activeTags) {
      if (!tagCharts || !activeTags || activeTags.length === 0) return null;
      var temporal = {};
      var sampleTypes = {};
      var pipeline = { collected: 0, dna_extracted: 0, sequenced: 0 };
      var samplerTypes = {};
      var found = false;

      Object.keys(tagCharts).forEach(function(colLabel) {
        var colData = tagCharts[colLabel];
        if (!colData || typeof colData !== 'object') return;
        activeTags.forEach(function(token) {
          if (!Object.prototype.hasOwnProperty.call(colData, token)) return;
          var tc = colData[token];
          if (!tc) return;
          found = true;
          (tc.temporal || []).forEach(function(pt) {
            temporal[pt.month] = (temporal[pt.month] || 0) + pt.count;
          });
          (tc.sample_types || []).forEach(function(pt) {
            sampleTypes[pt.type] = (sampleTypes[pt.type] || 0) + pt.count;
          });
          if (tc.pipeline) {
            pipeline.collected     += tc.pipeline.collected     || 0;
            pipeline.dna_extracted += tc.pipeline.dna_extracted || 0;
            pipeline.sequenced     += tc.pipeline.sequenced     || 0;
          }
          (tc.sampler_type_dist || []).forEach(function(pt) {
            samplerTypes[pt.sampler] = (samplerTypes[pt.sampler] || 0) + pt.count;
          });
        });
      });

      if (!found) return null;

      var temporalArr = Object.keys(temporal).sort().map(function(m) { return { month: m, count: temporal[m] }; });
      var sampleTypesArr = Object.keys(sampleTypes)
        .sort(function(a, b) { return sampleTypes[b] - sampleTypes[a]; })
        .map(function(t) { return { type: t, count: sampleTypes[t] }; });
      var samplerArr = Object.keys(samplerTypes)
        .sort(function(a, b) { return samplerTypes[b] - samplerTypes[a]; })
        .map(function(s) { return { sampler: s, count: samplerTypes[s] }; });

      return {
        temporal: temporalArr,
        sample_types: sampleTypesArr,
        pipeline: pipeline,
        sampler_type_dist: samplerArr,
      };
    }

    // Re-render the 4 common slice charts (types, pipeline, temporal, sampler)
    // for the given category using the provided chartData.
    // Does NOT re-render header, group info, badges, or location-only charts.
    function updateSliceCharts(category, chartData) {
      var typesId, pipelineId, temporalId, samplerChartId;
      if (category === SLICE_CATEGORIES.PROJECT) {
        typesId        = 'sliceProjectTypesChart';
        pipelineId     = 'sliceProjectPipelineChart';
        temporalId     = 'sliceProjectTemporalChart';
        samplerChartId = 'sliceProjectSamplerChart';
      } else if (category === SLICE_CATEGORIES.LOCATION) {
        typesId        = 'sliceLocationTypesChart';
        pipelineId     = null;
        temporalId     = 'sliceLocationTemporalChart';
        samplerChartId = 'sliceLocationSamplerChart';
      } else if (category === SLICE_CATEGORIES.LAB_GROUP) {
        typesId        = 'sliceLabGroupTypesChart';
        pipelineId     = 'sliceLabGroupPipelineChart';
        temporalId     = 'sliceLabGroupTemporalChart';
        samplerChartId = 'sliceLabGroupSamplerChart';
      } else {
        return;
      }

      // Sample Types doughnut
      if (typesId && chartData.sample_types && chartData.sample_types.length > 0) {
        destroyChart(typesId);
        var ctxT = document.getElementById(typesId);
        if (ctxT) {
          chartInstances[typesId] = new Chart(ctxT.getContext('2d'), {
            type: 'doughnut',
            data: {
              labels: chartData.sample_types.map(function(d) { return d.type; }),
              datasets: [{ data: chartData.sample_types.map(function(d) { return d.count; }),
                backgroundColor: chartData.sample_types.map(function(d) { return SAMPLE_TYPE_COLORS[d.type] || SAMPLE_TYPE_COLORS['Unknown']; }), borderColor: CHART_COLORS.donutBorder, borderWidth: 2 }]
            },
            options: {
              responsive: true, maintainAspectRatio: false, cutout: '65%',
              plugins: {
                legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 10, font: { size: 12 } } },
                tooltip: { backgroundColor: CHART_COLORS.tooltip, callbacks: { label: tooltipLabelPct } }
              }
            }
          });
        }
      }

      // Pipeline horizontal bar
      if (pipelineId && chartData.pipeline) {
        destroyChart(pipelineId);
        var ctxP = document.getElementById(pipelineId);
        if (ctxP) {
          chartInstances[pipelineId] = new Chart(ctxP.getContext('2d'), {
            type: 'bar',
            data: {
              labels: ['Collected', 'DNA Extracted', 'Sequenced'],
              datasets: [{ data: [chartData.pipeline.collected, chartData.pipeline.dna_extracted, chartData.pipeline.sequenced],
                backgroundColor: CHART_COLORS.slicePipeline, borderWidth: 0, borderRadius: 4 }]
            },
            options: {
              indexAxis: 'y', responsive: true, maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: CHART_COLORS.tooltip, callbacks: { label: tooltipLabelSamples } }
              },
              scales: {
                x: { beginAtZero: true, grid: { color: CHART_COLORS.gridLine },
                  ticks: { callback: function(val) { return val >= 1000 ? (val/1000).toFixed(1)+'k' : val; } } },
                y: { grid: { display: false } }
              }
            }
          });
        }
      }

      // Temporal line chart
      if (temporalId && chartData.temporal) {
        destroyChart(temporalId);
        var ctxTm = document.getElementById(temporalId);
        if (ctxTm) {
          var gapped = insertGapMarkers(chartData.temporal);
          chartInstances[temporalId] = new Chart(ctxTm.getContext('2d'), {
            type: 'bar',
            data: {
              labels: gapped.labels,
              datasets: [{ label: 'Samples Collected', data: gapped.counts,
                backgroundColor: CHART_COLORS.sliceTemporalBar, borderWidth: 0 }]
            },
            options: buildTemporalChartOptions()
          });
        }
      }

      // Sampler type doughnut (uses existing helper)
      if (samplerChartId) {
        renderSamplerTypeChart(samplerChartId, chartData.sampler_type_dist);
      }
    }

    // Refresh badge visual states AND re-render the active sidebar group list
    // to reflect the current tag filter selection.
    // IMPORTANT: does NOT call renderView() — only updates DOM directly.
    function applyFilter(fs) {
      // --- a) Refresh badge visual states ---
      var containers = ['globalReplicateBadges', 'sliceProjectReplicateBadges', 'sliceLocationReplicateBadges', 'sliceLabGroupReplicateBadges'];
      containers.forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.querySelectorAll('[data-tag]').forEach(function(badge) {
          var tag = badge.getAttribute('data-tag');
          var active = fs.tags.indexOf(tag) !== -1;
          badge.className = active ? TAG_BADGE_CLASSES.active : TAG_BADGE_CLASSES.inactive;
          badge.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      });

      // --- b) Filter and re-render the active sidebar group list ---
      var cat = filterState.slice.category;

      // Map category to list element id, data array, and key names
      var listConfig = null;
      if (cat === SLICE_CATEGORIES.PROJECT && appData && appData.slice_views && appData.slice_views.project) {
        listConfig = {
          listId:   'project-group-list',
          entries:  appData.slice_views.project,
          labelKey: 'project_id',
          idKey:    'project_id',
          countKey: 'sample_count'
        };
      } else if (cat === SLICE_CATEGORIES.LOCATION && appData && appData.slice_views && appData.slice_views.location) {
        listConfig = {
          listId:   'location-group-list',
          entries:  appData.slice_views.location,
          labelKey: 'site_name',
          idKey:    'site_code',
          countKey: 'sample_count'
        };
      } else if (cat === SLICE_CATEGORIES.LAB_GROUP && appData && appData.slice_views && appData.slice_views.lab_group) {
        listConfig = {
          listId:   'labgroup-group-list',
          entries:  appData.slice_views.lab_group,
          labelKey: 'group_name',
          idKey:    'group_name',
          countKey: 'sample_count'
        };
      }

      if (listConfig) {
        var listEl = document.getElementById(listConfig.listId);
        if (listEl) {
          // Remove any prior "no match" message
          var priorMsg = listEl.querySelector('.tag-filter-no-match');
          if (priorMsg) { listEl.removeChild(priorMsg); }

          if (fs.tags.length === 0) {
            // Restore full list with original counts
            populateGroupList(listEl, listConfig.entries, listConfig.labelKey, listConfig.idKey, listConfig.countKey);
            // Re-prepend pinned project_group items if this is the project list
            if (cat === SLICE_CATEGORIES.PROJECT && appData && appData.slice_views) {
              prependProjectGroupItems(listEl, appData.slice_views.project_group);
            }
            updateGroupItemSelection();
          } else {
            // Build filtered items — entries with filtered count > 0
            var filteredItems = [];
            listConfig.entries.forEach(function(entry) {
              var fc = getFilteredCount(entry, fs.tags);
              if (fc > 0) {
                // Clone entry shape expected by populateGroupList, overriding sample_count
                var clone = {};
                clone[listConfig.labelKey] = entry[listConfig.labelKey];
                clone[listConfig.idKey]    = entry[listConfig.idKey];
                clone[listConfig.countKey] = fc;
                filteredItems.push(clone);
              }
            });

            if (filteredItems.length === 0) {
              // All groups filtered to zero — show message
              listEl.innerHTML = '';
              var noMatchP = document.createElement('p');
              noMatchP.className = 'tag-filter-no-match text-sm text-stone-400 px-4 py-2';
              noMatchP.textContent = 'No samples match the selected tags.';
              listEl.appendChild(noMatchP);
            } else {
              populateGroupList(listEl, filteredItems, listConfig.labelKey, listConfig.idKey, listConfig.countKey);
              if (cat === SLICE_CATEGORIES.PROJECT && appData && appData.slice_views) {
                prependProjectGroupItems(listEl, appData.slice_views.project_group);
              }
              updateGroupItemSelection();
            }
          }
        }
      }

      // --- c) Update the selected group's displayed sample count ---
      var group = filterState.slice.group;
      if (group && cat && appData && appData.slice_views) {
        // Find the entry for the selected group
        var selectedEntry = null;
        if (cat === SLICE_CATEGORIES.PROJECT && appData.slice_views.project) {
          selectedEntry = appData.slice_views.project.find(function(e) { return e.project_id === group; });
        } else if (cat === SLICE_CATEGORIES.LOCATION && appData.slice_views.location) {
          selectedEntry = appData.slice_views.location.find(function(e) { return e.site_code === group; });
        } else if (cat === SLICE_CATEGORIES.LAB_GROUP && appData.slice_views.lab_group) {
          selectedEntry = appData.slice_views.lab_group.find(function(e) { return e.group_name === group; });
        }

        if (selectedEntry) {
          var filteredCount = fs.tags.length > 0 ? getFilteredCount(selectedEntry, fs.tags) : selectedEntry.sample_count;

          // Update the subtitle element that shows "N samples"
          var viewSubtitle = document.getElementById('slice-view-subtitle');
          if (viewSubtitle) {
            viewSubtitle.textContent = filteredCount.toLocaleString() + ' samples';
          }

          // Determine the slice charts area for the zero-match notice
          var sliceChartsAreaId = null;
          if (cat === SLICE_CATEGORIES.PROJECT)   { sliceChartsAreaId = 'slice-project-grid'; }
          if (cat === SLICE_CATEGORIES.LOCATION)  { sliceChartsAreaId = 'slice-location-grid'; }
          if (cat === SLICE_CATEGORIES.LAB_GROUP) { sliceChartsAreaId = 'slice-labgroup-grid'; }

          if (sliceChartsAreaId) {
            var chartsArea = document.getElementById(sliceChartsAreaId);
            if (chartsArea) {
              var chartsParent = chartsArea.parentNode;
              // Remove any prior zero-match amber notice
              var priorNotice = chartsParent ? chartsParent.querySelector('.tag-filter-zero-notice') : null;
              if (priorNotice) { priorNotice.parentNode.removeChild(priorNotice); }

              if (fs.tags.length > 0 && filteredCount === 0) {
                // Show amber notice at top of slice charts area
                var notice = document.createElement('p');
                notice.className = 'tag-filter-zero-notice text-sm text-amber-400 mb-2';
                notice.textContent = 'No samples match the selected tags for this group.';
                if (chartsParent) {
                  chartsParent.insertBefore(notice, chartsArea);
                }
              }
            }
          }
        }
      }

      // --- d) Update slice charts to reflect tag filter ---
      if (cat !== null && group !== null) {
        var activeEntry = getSliceEntry(cat, group);
        if (activeEntry) {
          if (fs.tags.length > 0 && activeEntry.tag_charts) {
            var merged = mergeTagChartData(activeEntry.tag_charts, fs.tags);
            if (merged) { updateSliceCharts(cat, merged); }
          } else if (fs.tags.length === 0) {
            updateSliceCharts(cat, {
              temporal:          activeEntry.temporal,
              sample_types:      activeEntry.sample_types,
              pipeline:          activeEntry.pipeline,
              sampler_type_dist: activeEntry.sampler_type_dist,
            });
          }
        }
      }

      // --- e) Update the tag filter banner ---
      updateTagBanner();
      refreshTableIfReady();
    }

    // Cross-link state — bidirectional map-marker ↔ bySite bar chart highlight
    var activeHighlightSite = null;
    var mapMarkersBySite = {};
    var siteLatLonByCode = {};

    // =============================================================================
    // HELPERS
    // =============================================================================
    function formatDate(isoString) {
      try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return isoString;
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      } catch (_) {
        return isoString;
      }
    }

    function formatMonth(yyyyMm) {
      try {
        var parts = yyyyMm.split('-');
        var year  = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10) - 1;
        var d     = new Date(year, month, 1);
        var abbr  = d.toLocaleDateString('en-US', { month: 'short' });
        var yy    = String(year).slice(-2);
        return abbr + " '" + yy;
      } catch (_) { return yyyyMm; }
    }

    function destroyChart(key) {
      if (chartInstances[key]) {
        chartInstances[key].destroy();
        chartInstances[key] = null;
      }
    }

    // Shared tooltip callback: percentage label for doughnut/pie charts
    function tooltipLabelPct(ctx) {
      var total = ctx.dataset.data.reduce(function(a, b) { return a + b; }, 0);
      var pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
      return ' ' + ctx.label + ': ' + ctx.parsed.toLocaleString() + ' (' + pct + '%)';
    }

    // Shared tooltip callback: sample count label for horizontal bar charts
    function tooltipLabelSamples(ctx) {
      return ' ' + ctx.parsed.x.toLocaleString() + ' samples';
    }

    function renderSamplerTypeChart(canvasId, samplerData) {
      destroyChart(canvasId);
      var canvas = document.getElementById(canvasId);
      if (!canvas) { return; }
      var wrap = canvas.parentElement;
      if (!samplerData || samplerData.length === 0) {
        wrap.innerHTML = '<p class="text-sm text-stone-400 py-8 text-center">No sampler data available</p>';
        return;
      }
      // Zero guard: log scale breaks on log(0) — exclude entries with zero count.
      var filtered = samplerData.filter(function(d) { return d.count > 0; });
      if (filtered.length === 0) {
        wrap.innerHTML = '<p class="text-sm text-stone-400 py-8 text-center">No sampler data available</p>';
        return;
      }
      chartInstances[canvasId] = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: filtered.map(function(d) { return d.sampler; }),
          datasets: [{
            data: filtered.map(function(d) { return d.count; }),
            backgroundColor: Object.values(SAMPLE_TYPE_COLORS)  // Okabe pool for categorical sampler bars
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: CHART_COLORS.tooltip,
              callbacks: {
                label: function(ctx) {
                  return ' ' + ctx.parsed.y.toLocaleString() + ' samples';
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 } }
            },
            y: {
              type: 'logarithmic',
              grid: { color: CHART_COLORS.gridLine },
              ticks: {
                font: { size: 10 },
                callback: function(val) {
                  return val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val;
                }
              }
            }
          }
        }
      });
    }

    // =============================================================================
    // KPI CARDS
    // =============================================================================
    function renderKPIs(kpis) {
      document.getElementById('kpi-field-samples').textContent = kpis.field_samples.toLocaleString();
      document.getElementById('kpi-unique-sites').textContent  = kpis.unique_sites.toLocaleString();
      document.getElementById('kpi-active-since').textContent  = kpis.active_since;
      document.getElementById('kpi-sequenced').textContent     = kpis.sequenced.toLocaleString();

      document.getElementById('hero-samples').textContent = kpis.field_samples.toLocaleString() + ' field samples';
      document.getElementById('hero-sites').textContent   = kpis.unique_sites + ' collection sites';
      document.getElementById('hero-since').textContent   = 'Active since ' + kpis.active_since;
    }

    // =============================================================================
    // DATA MANAGEMENT SECTION
    // =============================================================================

    /**
     * formatDateRange(start, end)
     * Converts "YYYY-MM" strings to "Mon YYYY–Mon YYYY" display format.
     * Uses en-dash (U+2013) as separator per design spec.
     * @param {string} start - "YYYY-MM"
     * @param {string} end   - "YYYY-MM"
     * @returns {string}
     */
    function formatDateRange(start, end) {
      var opts = { month: 'short', year: 'numeric' };
      var s = new Date(start + '-01T00:00:00').toLocaleDateString('en-US', opts);
      var e = new Date(end   + '-01T00:00:00').toLocaleDateString('en-US', opts);
      return s + '–' + e;
    }

    /**
     * renderDataManagement(dm)
     * Populates the #data-management section from the data.data_management object.
     * All values read from dm.* — no hardcoded numbers.
     * @param {Object} dm - data.data_management
     */
    function renderDataManagement(dm) {
      // --- KPI: Archived & Cataloged ---
      document.getElementById('dm-archived-value').textContent = dm.archived.count.toLocaleString();
      document.getElementById('dm-archived-pct').textContent = dm.archived.pct + '%';

      // --- KPI: Amplicon Sequenced (16S/ITS) ---
      document.getElementById('dm-amplicon-value').textContent = dm.amplicon.count.toLocaleString();
      document.getElementById('dm-amplicon-pct').textContent = dm.amplicon.pct + '%';

      // --- KPI: Metagenomics ---
      document.getElementById('dm-metagenomics-value').textContent = dm.metagenomics.count.toLocaleString();
      document.getElementById('dm-metagenomics-pct').textContent = dm.metagenomics.pct + '%';
      document.getElementById('dm-metagenomics-callout').textContent =
        dm.metagenomics.deposited + ' of ' + dm.metagenomics.count + ' metagenomes deposited';

      // --- KPI: Deposited (strict = headline, broad = secondary) ---
      document.getElementById('dm-deposited-strict-value').textContent = dm.uploaded.strict.pct + '%';
      document.getElementById('dm-deposited-strict-count').textContent =
        '(' + dm.uploaded.strict.count.toLocaleString() + ' samples)';
      document.getElementById('dm-deposited-broad-subtext').textContent =
        dm.uploaded.broad.pct + '% linked to a publication or public record';

      // --- Duration: CPER ---
      document.getElementById('dm-cper-daterange').textContent =
        formatDateRange(dm.duration.CPER.start, dm.duration.CPER.end);
      document.getElementById('dm-cper-total-label').textContent =
        'Tower breakdown — ' + dm.neon_towers.CPER.total.toLocaleString() + ' samples';
      document.getElementById('dm-cper-top').textContent =
        'Top (A): ' + dm.neon_towers.CPER.tower_top.toLocaleString();
      document.getElementById('dm-cper-bottom').textContent =
        'Bottom (B): ' + dm.neon_towers.CPER.tower_bottom.toLocaleString();
      document.getElementById('dm-cper-env').textContent =
        'Environment: ' + dm.neon_towers.CPER.environment.toLocaleString();

      // --- Duration: SGRC ---
      document.getElementById('dm-sgrc-daterange').textContent =
        formatDateRange(dm.duration.SGRC.start, dm.duration.SGRC.end);
      document.getElementById('dm-sgrc-months').textContent =
        '~' + dm.duration.SGRC.months + ' months';

      // --- Duration: NWT ---
      document.getElementById('dm-nwt-daterange').textContent =
        formatDateRange(dm.neon_towers.NWT.start, dm.neon_towers.NWT.end);
      document.getElementById('dm-nwt-total-label').textContent =
        'Tower breakdown — ' + dm.neon_towers.NWT.total.toLocaleString() + ' samples';
      document.getElementById('dm-nwt-top').textContent =
        'Top: ' + dm.neon_towers.NWT.top.toLocaleString();
      document.getElementById('dm-nwt-middle').textContent =
        'Middle: ' + dm.neon_towers.NWT.middle.toLocaleString();
      document.getElementById('dm-nwt-bottom').textContent =
        'Bottom: ' + dm.neon_towers.NWT.bottom.toLocaleString();

      // --- Hosting note ---
      document.getElementById('dm-hosting-note').textContent = dm.hosting;
    }

    // =============================================================================
    // TEMPORAL GAP MARKER HELPER
    // =============================================================================
    /**
     * insertGapMarkers(temporal)
     * Accepts the raw temporal array [{month: "YYYY-MM", count: N}, ...]
     * Scans for non-consecutive month transitions (year-boundary aware).
     * When a gap is detected, inserts {month: '···', count: null} between the two months.
     * Returns {labels: string[], counts: (number|null)[]}
     *
     * Consecutive examples:
     *   "2020-12" -> "2021-01"  → consecutive (no gap marker inserted)
     *   "2020-11" -> "2021-01"  → NOT consecutive (one gap marker inserted)
     */
    function insertGapMarkers(temporal) {
      var labels = [];
      var counts = [];

      for (var i = 0; i < temporal.length; i++) {
        var entry = temporal[i];
        if (i > 0) {
          var prev = temporal[i - 1];
          var prevParts = prev.month.split('-');
          var currParts = entry.month.split('-');
          var prevYear  = parseInt(prevParts[0], 10);
          var prevMonth = parseInt(prevParts[1], 10);
          var currYear  = parseInt(currParts[0], 10);
          var currMonth = parseInt(currParts[1], 10);
          // Compute expected next year/month from prev
          var expYear  = prevMonth === 12 ? prevYear + 1 : prevYear;
          var expMonth = prevMonth === 12 ? 1 : prevMonth + 1;
          // If the current entry does not match the expected next month, insert a gap marker
          if (currYear !== expYear || currMonth !== expMonth) {
            labels.push('\u00B7\u00B7\u00B7');
            counts.push(null);
          }
        }
        labels.push(formatMonth(entry.month));
        counts.push(entry.count);
      }

      return { labels: labels, counts: counts };
    }

    // =============================================================================
    // TEMPORAL LINE CHART
    // =============================================================================
    function renderTemporalChart(temporal) {
      destroyChart('temporal');
      const ctx = document.getElementById('temporalChart').getContext('2d');
      var gapped = insertGapMarkers(temporal);
      const labels = gapped.labels;
      const counts = gapped.counts;

      chartInstances.temporal = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Samples Collected',
            data: counts,
            /* TEMPORAL BAR COLOR — edit CHART_COLORS.temporalBar to change */
            backgroundColor: CHART_COLORS.temporalBar,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: CHART_COLORS.tooltip,
              padding: 10,
              titleFont: { size: 12 },
              bodyFont: { size: 12 },
              callbacks: {
                title: function(items) { return items[0].label; },
                label: function(ctx) {
                  if (ctx.parsed.y === null || ctx.parsed.y === undefined) { return ''; }
                  var monthLabel = ctx.label;
                  var entry = (appData && appData.temporal || []).find(function(t) { return t.month === monthLabel; });
                  if (!entry || !entry.types || entry.types.length === 0) {
                    return ' ' + ctx.parsed.y.toLocaleString() + ' samples';
                  }
                  return entry.types.map(function(t) { return ' ' + t.type + ': ' + t.count.toLocaleString(); });
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: CHART_COLORS.gridLine },
              title: { display: true, text: 'Samples', color: CHART_COLORS.axisLabel, font: { size: 11 } }
            },
            x: {
              grid: { display: false },
              ticks: { maxRotation: 45, autoSkip: false, font: { size: 10 } },
              title: { display: true, text: 'Collection Date (Month/Year)', color: CHART_COLORS.axisLabel, font: { size: 11 } }
            }
          }
        }
      });
    }

    // =============================================================================
    // SAMPLE TYPE DONUT CHART
    // =============================================================================
    function renderDonutChart(sampleTypes) {
      destroyChart('donut');
      const ctx = document.getElementById('donutChart').getContext('2d');
      const labels = sampleTypes.map(function(d) { return d.type; });
      const counts = sampleTypes.map(function(d) { return d.count; });

      chartInstances.donut = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: counts,
            backgroundColor: labels.map(function(t) { return SAMPLE_TYPE_COLORS[t] || SAMPLE_TYPE_COLORS['Unknown']; }),
            borderWidth: 2,
            borderColor: CHART_COLORS.donutBorder
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'right',
              labels: { usePointStyle: true, boxWidth: 10, font: { size: 12 } }
            },
            tooltip: {
              enabled: false,
              external: function(context) {
                if (context.tooltip.opacity === 0) { hideCustomTooltip(); return; }
                var rect = context.chart.canvas.getBoundingClientRect();
                var label = context.tooltip.dataPoints[0].label;
                var x = rect.left + context.tooltip.caretX;
                var y = rect.top + context.tooltip.caretY;
                var crossTab = appData && appData.type_pipeline_crossTab && appData.type_pipeline_crossTab[label];
                if (!crossTab) {
                  showCustomTooltip(x, y, buildTooltipHtml(label, []));
                  return;
                }
                var html = '<strong>' + escapeHtml(label) + '</strong><br>' +
                  'Collected: ' + (crossTab.collected || 0).toLocaleString() + '<br>' +
                  'Extracted: ' + (crossTab.dna_extracted || 0).toLocaleString() + '<br>' +
                  'Sequenced: ' + (crossTab.sequenced || 0).toLocaleString();
                showCustomTooltip(x, y, html);
              }
            }
          }
        }
      });
    }

    // =============================================================================
    // PIPELINE HORIZONTAL BAR CHART
    // =============================================================================
    function renderPipelineChart(pipeline) {
      destroyChart('pipeline');
      const ctx = document.getElementById('pipelineChart').getContext('2d');

      chartInstances.pipeline = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Collected', 'DNA Extracted', 'Sequenced'],
          datasets: [{
            label: 'Sample Count',
            data: [pipeline.collected, pipeline.dna_extracted, pipeline.sequenced],
            backgroundColor: CHART_COLORS.pipeline,
            borderWidth: 0,
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: false,
              external: function(context) {
                if (context.tooltip.opacity === 0) { hideCustomTooltip(); return; }
                var rect = context.chart.canvas.getBoundingClientRect();
                var label = context.tooltip.dataPoints[0].label;
                var x = rect.left + context.tooltip.caretX;
                var y = rect.top + context.tooltip.caretY;
                var keyMap = { 'Collected': 'collected', 'DNA Extracted': 'dna_extracted', 'Sequenced': 'sequenced' };
                var pKey = keyMap[label];
                var typeList = appData && appData.pipeline_type_crossTab && pKey && appData.pipeline_type_crossTab[pKey];
                if (!typeList) {
                  showCustomTooltip(x, y, buildTooltipHtml(label, []));
                  return;
                }
                var breakdown = typeList.map(function(t) { return { name: t.type, count: t.count }; });
                showCustomTooltip(x, y, buildTooltipHtml(label, breakdown));
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: CHART_COLORS.gridLine },
              ticks: {
                callback: function(val) {
                  return val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val;
                }
              }
            },
            y: { grid: { display: false } }
          }
        }
      });
    }

    // =============================================================================
    // SAMPLES BY SITE HORIZONTAL BAR CHART
    // =============================================================================
    function renderBySiteChart(bySite) {
      destroyChart('bySite');
      const ctx = document.getElementById('bySiteChart').getContext('2d');

      // Already sorted descending in data.json, but sort defensively
      var sorted = bySite.slice().sort(function(a, b) { return b.count - a.count; });

      // Show the readable site name (e.g. "SGRC — Environment") instead of the
      // cryptic 2-char code, so bar labels match the map marker tooltips and
      // groupings like SGRC are visible. The code is retained separately
      // (bySiteCodes) for the map cross-link click.
      var labels = sorted.map(function(d) { return d.site || d.code; });
      var counts = sorted.map(function(d) { return d.count; });
      // Full name for tooltip
      var names  = sorted.map(function(d) { return d.site; });

      /* BY-SITE CHART HEIGHT — pixels per bar entry; edit this constant to tune */
      var MIN_BAR_HEIGHT = 28; // px per entry
      var computedHeight = Math.max(300, sorted.length * MIN_BAR_HEIGHT);
      document.getElementById('bySiteChartWrap').style.height = computedHeight + 'px';

      chartInstances.bySite = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Samples',
            data: counts,
            backgroundColor: CHART_COLORS.siteBar,
            borderWidth: 0,
            borderRadius: 0
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          onClick: function(evt, elements) {
            if (!elements || elements.length === 0) return;
            var idx = elements[0].index;
            var code = chartInstances.bySiteCodes[idx];
            if (code) highlightSite(code);
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: CHART_COLORS.tooltip,
              callbacks: {
                title: function(items) {
                  var i = items[0].dataIndex;
                  var nm = names[i] || items[0].label;
                  var cd = sorted[i] && sorted[i].code;
                  return cd ? nm + ' (' + cd + ')' : nm;
                },
                label: function(ctx) {
                  var lines = [' ' + ctx.parsed.x.toLocaleString() + ' samples'];
                  var code = sorted[ctx.dataIndex] && sorted[ctx.dataIndex].code;
                  if (code) {
                    var siteEntry = (appData && appData.sites || []).find(function(s) { return s.code === code; });
                    var types = siteEntry && siteEntry.primary_types ? siteEntry.primary_types.slice(0, 3).join(', ') : null;
                    if (types) { lines.push('Types: ' + types); }
                    var dr = appData && appData.site_date_ranges && appData.site_date_ranges[code];
                    if (dr) { lines.push('Collection: ' + dr.first + ' \u2013 ' + dr.last); }
                  }
                  return lines;
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: CHART_COLORS.gridLine },
              ticks: {
                callback: function(val) {
                  return val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val;
                },
                font: { size: 10 }
              }
            },
            y: {
              grid: { display: false },
              /* BY-SITE Y-AXIS TICKS — autoSkip: false ensures all labels show;
                 long site names truncate with an ellipsis (full name + code in tooltip) */
              ticks: {
                font: { size: 10 },
                autoSkip: false,
                callback: function(val) {
                  var label = this.getLabelForValue(val);
                  return label && label.length > 24 ? label.slice(0, 23) + '…' : label;
                }
              }
            }
          }
        }
      });
      chartInstances.bySiteCodes = sorted.map(function(d) { return d.code || d.site; });
    }

    // =============================================================================
    // LEAFLET MAP
    // =============================================================================
    var leafletMap = null;

    function renderMap(sites) {
      if (leafletMap) {
        leafletMap.remove();
        leafletMap = null;
      }
      mapMarkersBySite = {};

      leafletMap = L.map('map', { zoomControl: true }).setView(MAP_CENTER_DEFAULT, MAP_ZOOM_DEFAULT);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(leafletMap);

      sites.forEach(function(site) {
        // Skip sites with null coordinates
        if (site.lat === null || site.lon === null) return;

        var radius = Math.max(6, Math.min(22, Math.sqrt(site.count) * 2));
        var marker = L.circleMarker([site.lat, site.lon], {
          radius: radius,
          fillColor: CHART_COLORS.mapMarkerFill,
          color: CHART_COLORS.mapMarkerBorder,
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.55
        });

        mapMarkersBySite[site.code] = marker;
        siteLatLonByCode[site.code] = { lat: site.lat, lon: site.lon };
        marker.on('click', function() { highlightSite(site.code); });

        var typesLabel = site.primary_types && site.primary_types.length
          ? site.primary_types.join(', ')
          : 'N/A';

        var dateRange = appData && appData.site_date_ranges && appData.site_date_ranges[site.code];
        var dateRangeLine = dateRange ? '<br>Collection: ' + dateRange.first + ' \u2013 ' + dateRange.last : '';
        marker.bindTooltip(
          '<strong class="block">' + site.name + (site.code ? ' (' + site.code + ')' : '') + '</strong>' +
          'Samples: <strong>' + site.count.toLocaleString() + '</strong><br>' +
          'Types: ' + typesLabel + dateRangeLine,
          { sticky: true, direction: 'top', offset: [0, -8] }
        );

        marker.addTo(leafletMap);
      });
    }

    // =============================================================================
    // SITE CROSS-LINK HIGHLIGHT
    // =============================================================================
    function highlightSite(code) {
      if (activeHighlightSite === code) {
        clearSiteHighlight();
        return;
      }
      activeHighlightSite = code;

      // Update bySite bar chart
      if (chartInstances.bySite && chartInstances.bySiteCodes) {
        var matchIdx = chartInstances.bySiteCodes.indexOf(code);
        chartInstances.bySite.data.datasets[0].backgroundColor =
          chartInstances.bySiteCodes.map(function(c, i) {
            return i === matchIdx ? CHART_COLORS.orangeAccent : CHART_COLORS.orangeAccentDim;
          });
        chartInstances.bySite.update();
      }

      // Update map markers
      Object.keys(mapMarkersBySite).forEach(function(siteCode) {
        var m = mapMarkersBySite[siteCode];
        if (siteCode === code) {
          m.setStyle({ fillColor: CHART_COLORS.orangeAccent, color: CHART_COLORS.orangeAccentDim });
        } else {
          m.setStyle({ fillColor: CHART_COLORS.mapMarkerFill, color: CHART_COLORS.mapMarkerBorder });
        }
      });

      // Fly map to the selected site
      if (leafletMap && siteLatLonByCode[code]) {
        leafletMap.flyTo([siteLatLonByCode[code].lat, siteLatLonByCode[code].lon], 12);
      }
    }

    function clearSiteHighlight() {
      activeHighlightSite = null;

      // Restore bySite bar chart to uniform color
      if (chartInstances.bySite) {
        chartInstances.bySite.data.datasets[0].backgroundColor = CHART_COLORS.siteBar;
        chartInstances.bySite.update();
      }

      // Restore all map markers to original style
      Object.keys(mapMarkersBySite).forEach(function(siteCode) {
        mapMarkersBySite[siteCode].setStyle({
          fillColor: CHART_COLORS.mapMarkerFill,
          color: CHART_COLORS.mapMarkerBorder
        });
      });

      // Reset map view to default
      if (leafletMap) {
        leafletMap.setView(MAP_CENTER_DEFAULT, MAP_ZOOM_DEFAULT);
      }
    }

    // =============================================================================
    // DATA EXPLORER TABLE
    // =============================================================================
    function buildFilterOptions(samples) {
      var cats   = new Set();
      var sites  = new Set();
      var years  = new Set();

      samples.forEach(function(s) {
        if (s.category) cats.add(s.category);
        if (s.site)     sites.add(s.site);
        if (s.date)     years.add(s.date.slice(0, 4));
      });

      function populateSelect(id, values) {
        var sel = document.getElementById(id);
        Array.from(values).sort().forEach(function(v) {
          var opt = document.createElement('option');
          opt.value = v;
          opt.textContent = v;
          sel.appendChild(opt);
        });
      }

      populateSelect('filter-category', cats);
      populateSelect('filter-site', sites);

      // Populate year in descending order
      var yearSel = document.getElementById('filter-year');
      Array.from(years).sort().reverse().forEach(function(y) {
        var opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        yearSel.appendChild(opt);
      });
    }

    function getTypeBadgeClasses(type) {
      return SAMPLE_TYPE_CLASSES[type] || 'bg-stone-100 text-stone-600';
    }

    function getCategoryBadgeClasses(cat) {
      return CATEGORY_CLASSES[cat] || 'bg-stone-100 text-stone-600';
    }

    var STAGE_BADGE_CLASSES = {
      collected: 'bg-stone-100 text-stone-600',
      extracted: 'bg-amber-100 text-amber-800',
      sequenced: 'bg-green-100 text-green-800'
    };
    var STAGE_LABELS = { collected: 'Collected', extracted: 'DNA Extracted', sequenced: 'Sequenced' };

    // Sample-request ("checkout") email targets. Data inbox is primary; OneHealth contact is cc'd.
    var REQUEST_EMAIL_TO = 'ohi_broadn_data@colostate.edu';
    var REQUEST_EMAIL_CC = 'onehealth_contact@colostate.edu';

    // Build a prefilled mailto: link for requesting a physical sample. Returns the raw URL;
    // callers embedding in innerHTML must &amp;-escape it (browsers decode it back for the href).
    function buildRequestHref(row) {
      var subject = 'BROADN sample request: ' + (row.id || '');
      var body = [
        'I would like to request the following BROADN sample:',
        '',
        'Sample ID: ' + (row.id || ''),
        'Type: ' + (row.type || ''),
        'Site: ' + (row.site || ''),
        'Collection date: ' + (row.date || ''),
        'Project: ' + (row.project || ''),
        'Pipeline stage: ' + (STAGE_LABELS[row.pipeline_stage] || row.pipeline_stage || ''),
        '',
        'Requester name: ',
        'Affiliation: ',
        'Intended use: ',
        '',
        '(Sent from the BROADN Data Explorer)'
      ].join('\n');
      return 'mailto:' + REQUEST_EMAIL_TO +
        '?cc=' + encodeURIComponent(REQUEST_EMAIL_CC) +
        '&subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    }

    function renderTable(samples, page) {
      page = page || 1;

      // --- Step A: dashboard filter ---
      var dashFiltered = samples.filter(function(s) {
        var sliceCat   = filterState.slice.category;
        var sliceGroup = filterState.slice.group;
        var passSlice  = true;
        if (sliceCat === SLICE_CATEGORIES.PROJECT && sliceGroup) {
          // sliceGroup may be an individual project_id OR a pinned project_group
          // group_id (e.g. "CPER"). Samples carry the program on `project_group`,
          // not `project`, so match the correct field — mirrors renderView's
          // project_group precedence. Without this, selecting a project group
          // filtered the Explorer to zero rows.
          var isProjectGroup = appData && appData.slice_views && appData.slice_views.project_group &&
            appData.slice_views.project_group.some(function(e) { return e.group_id === sliceGroup; });
          passSlice = isProjectGroup ? (s.project_group === sliceGroup) : (s.project === sliceGroup);
        } else if (sliceCat === SLICE_CATEGORIES.LOCATION && sliceGroup) {
          passSlice = s.site === sliceGroup;
        } else if (sliceCat === SLICE_CATEGORIES.LAB_GROUP && sliceGroup) {
          passSlice = s.lab_group === sliceGroup;
        }
        if (!passSlice) return false;

        if (filterState.tags && filterState.tags.length > 0) {
          var allMatch = filterState.tags.every(function(token) {
            if (s.am_pm === token) return true;
            if (s.replicate === token) return true;
            if (s.field_control === token) return true;
            if (s.position === token) return true;
            if (s.quadrant) {
              var parts = s.quadrant.split(',').map(function(t) { return t.trim(); });
              if (parts.indexOf(token) !== -1) return true;
            }
            return false;
          });
          if (!allMatch) return false;
        }
        return true;
      });

      // --- Step B: local filter ---
      var cat   = document.getElementById('filter-category').value;
      var site  = document.getElementById('filter-site').value;
      var year  = document.getElementById('filter-year').value;
      var stageSel = document.getElementById('filter-stage');
      var stage = stageSel ? stageSel.value : '';

      var filtered = dashFiltered.filter(function(s) {
        var matchCat   = !cat   || s.category === cat;
        var matchSite  = !site  || s.site === site;
        var matchYear  = !year  || (s.date && s.date.startsWith(year));
        var matchStage = !stage || s.pipeline_stage === stage;
        return matchCat && matchSite && matchYear && matchStage;
      });

      // --- Step C: pagination ---
      var total      = filtered.length;
      var totalPages = Math.ceil(total / PAGE_SIZE) || 1;
      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;
      tableCurrentPage = page;

      var start    = (page - 1) * PAGE_SIZE;
      var pageRows = filtered.slice(start, start + PAGE_SIZE);

      // --- Update row count ---
      var countEl = document.getElementById('table-row-count');
      if (total === 0) {
        countEl.textContent = 'No samples match the selected filters';
      } else if (total <= PAGE_SIZE) {
        countEl.textContent = 'Showing ' + total + ' of ' + total + ' samples';
      } else {
        countEl.textContent =
          'Showing ' + (start + 1) + '\u2013' + Math.min(start + PAGE_SIZE, total) +
          ' of ' + total + ' samples';
      }

      // --- Render rows ---
      var tbody = document.getElementById('explorer-tbody');
      tbody.innerHTML = '';

      if (pageRows.length === 0) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="7" class="px-6 py-8 text-center text-stone-500">No samples match the selected filters.</td>';
        tbody.appendChild(tr);
      } else {
        pageRows.forEach(function(row) {
          var tr = document.createElement('tr');
          tr.className = 'bg-white hover:bg-stone-50 transition-colors';
          var typeCls = getTypeBadgeClasses(row.type);
          var catCls  = getCategoryBadgeClasses(row.category);
          tr.innerHTML =
            '<th scope="row" class="px-6 py-4 font-medium text-stone-900 whitespace-nowrap">' + escapeHtml(row.id) + '</th>' +
            '<td class="px-6 py-4 text-stone-600">' + escapeHtml(row.date) + '</td>' +
            '<td class="px-6 py-4 text-stone-600">' + escapeHtml(row.site) + '</td>' +
            '<td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium ' + typeCls + '">' + escapeHtml(row.type) + '</span></td>' +
            '<td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium ' + catCls + '">' + escapeHtml(row.category) + '</span></td>' +
            '<td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium ' + (STAGE_BADGE_CLASSES[row.pipeline_stage] || 'bg-stone-100 text-stone-600') + '">' + escapeHtml(STAGE_LABELS[row.pipeline_stage] || row.pipeline_stage || '—') + '</span></td>' +
            '<td class="px-6 py-4"><a href="' + buildRequestHref(row).replace(/&/g, '&amp;') + '" class="inline-flex items-center gap-1 rounded-md border border-green-700 text-green-800 hover:bg-green-50 text-xs font-medium px-2 py-1" aria-label="Request sample ' + escapeHtml(row.id) + ' by email">Request ✉</a></td>';
          tbody.appendChild(tr);
        });
      }

      // --- Render pagination controls ---
      var paginationEl = document.getElementById('table-pagination');
      if (paginationEl) {
        if (totalPages <= 1) {
          paginationEl.innerHTML = '';
          paginationEl.style.display = 'none';
        } else {
          paginationEl.style.display = '';
          var prevDisabled = page <= 1;
          var nextDisabled = page >= totalPages;
          paginationEl.innerHTML =
            '<button id="table-prev-btn" type="button" aria-label="Previous page"' +
            (prevDisabled ? ' disabled' : '') +
            ' class="px-3 py-1 rounded border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>' +
            '<span>Page ' + page + ' of ' + totalPages + '</span>' +
            '<button id="table-next-btn" type="button" aria-label="Next page"' +
            (nextDisabled ? ' disabled' : '') +
            ' class="px-3 py-1 rounded border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>';

          if (!prevDisabled) {
            document.getElementById('table-prev-btn').addEventListener('click', function() {
              renderTable(appData.all_samples, tableCurrentPage - 1);
            });
          }
          if (!nextDisabled) {
            document.getElementById('table-next-btn').addEventListener('click', function() {
              renderTable(appData.all_samples, tableCurrentPage + 1);
            });
          }
        }
      }
    }

    function refreshTableIfReady() {
      if (appData && appData.all_samples) {
        tableCurrentPage = 1;
        renderTable(appData.all_samples, 1);
      }
    }

    function escapeHtml(str) {
      if (str == null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function showCustomTooltip(x, y, htmlContent) {
      var el = document.getElementById('custom-tooltip');
      el.innerHTML = htmlContent;
      el.style.display = 'block';
      el.style.left = (x + 12) + 'px';
      el.style.top  = (y + 12) + 'px';
    }

    function hideCustomTooltip() {
      document.getElementById('custom-tooltip').style.display = 'none';
    }

    function buildTooltipHtml(label, breakdown) {
      var html = '<strong>' + escapeHtml(label) + '</strong><br>';
      breakdown.sort(function(a, b) { return b.count - a.count; });
      var top = breakdown.slice(0, 5);
      for (var i = 0; i < top.length; i++) {
        html += escapeHtml(top[i].name) + ': ' + top[i].count + '<br>';
      }
      return html;
    }

    // Canonical column display order — matches TAG_COL_DISPLAY in preprocess_data.py
    var TAG_COL_ORDER = ['AM/PM', 'Replicate', 'Quadrant', 'Position', 'Field Control'];

    /**
     * renderTagGroups(containerId, data)
     * Renders tag badges grouped by source column.
     *
     * data: { colLabel: { token: count } }
     * Each column renders as a labeled row of clickable badges showing "token (count)".
     * Falls back to "None recorded" when data is empty.
     */
    function renderTagGroups(containerId, data) {
      var container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';

      // Empty-data fallback
      var hasAny = false;
      if (data && typeof data === 'object') {
        Object.keys(data).forEach(function(k) {
          var v = data[k];
          if (v && typeof v === 'object' && Object.keys(v).length > 0) { hasAny = true; }
        });
      }
      if (!hasAny) {
        var fallback = document.createElement('span');
        fallback.className = 'text-sm text-stone-400';
        fallback.textContent = 'None recorded';
        container.appendChild(fallback);
        return;
      }

      // Render in canonical order; append any unlisted column keys after
      var allKeys = Object.keys(data);
      var orderedKeys = TAG_COL_ORDER.filter(function(k) { return allKeys.indexOf(k) !== -1; });
      var extraKeys = allKeys.filter(function(k) { return TAG_COL_ORDER.indexOf(k) === -1; });
      var renderOrder = orderedKeys.concat(extraKeys);

      renderOrder.forEach(function(colLabel) {
        var tokenCounts = data[colLabel];
        if (!tokenCounts || typeof tokenCounts !== 'object' || Object.keys(tokenCounts).length === 0) return;

        var groupRow = document.createElement('div');
        groupRow.className = 'flex flex-wrap items-center gap-1 mb-1';

        var colLabelEl = document.createElement('span');
        colLabelEl.className = 'text-xs text-stone-400 mr-1 shrink-0';
        colLabelEl.textContent = colLabel;
        groupRow.appendChild(colLabelEl);

        Object.keys(tokenCounts).forEach(function(token) {
          var count = tokenCounts[token];
          var badge = document.createElement('button');
          var isActive = filterState.tags.indexOf(token) !== -1;
          badge.className = isActive ? TAG_BADGE_CLASSES.active : TAG_BADGE_CLASSES.inactive;
          badge.setAttribute('data-tag', token);
          badge.setAttribute('tabindex', '0');
          badge.setAttribute('role', 'button');
          badge.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          badge.textContent = token + ' (' + count + ')';

          function toggleTag() {
            var idx = filterState.tags.indexOf(token);
            if (idx === -1) {
              filterState.tags.push(token);
            } else {
              filterState.tags.splice(idx, 1);
            }
            applyFilter(filterState);
          }

          badge.addEventListener('click', toggleTag);
          badge.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleTag();
            }
          });

          groupRow.appendChild(badge);
        });

        container.appendChild(groupRow);
      });
    }

    // =============================================================================
    // FOOTER DATE
    // =============================================================================
    function renderFooterDate(generated) {
      document.getElementById('footer-updated').textContent = formatDate(generated);
    }

    // =============================================================================
    // SCROLL SPY
    // =============================================================================
    function initScrollSpy() {
      var sections = document.querySelectorAll('section[id]');
      var navLinks = document.querySelectorAll('.nav-link[data-section]');

      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function(link) {
              link.classList.remove('active');
              if (link.getAttribute('data-section') === id) {
                link.classList.add('active');
              }
            });
          }
        });
      }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

      sections.forEach(function(s) { observer.observe(s); });
    }

    // =============================================================================
    // SLICE SIDEBAR — GROUP LIST POPULATION
    // =============================================================================

    /**
     * Populate a group list <ul> with <li> items from an array.
     * labelKey: property name for the display label
     * idKey: property name used as the group identifier in filterState.slice.group
     * countKey: property name for sample_count
     */
    /**
     * Prepend project_group entries as pinned bold items at the top of the project list.
     * Idempotent: removes any existing pinned items before re-adding.
     */
    function prependProjectGroupItems(listEl, projectGroups) {
      if (!listEl) return;
      // Remove any existing pinned items so this is safe to call repeatedly
      var existing = listEl.querySelectorAll('[data-group-kind="project_group"]');
      existing.forEach(function(el) { el.remove(); });
      if (!projectGroups || projectGroups.length === 0) return;
      var pinned = projectGroups.slice().sort(function(a, b) {
        return b.sample_count - a.sample_count;
      });
      // Insert in reverse so the largest group ends up at index 0
      pinned.reverse().forEach(function(pg) {
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('tabindex', '0');
        li.setAttribute('aria-selected', 'false');
        li.setAttribute('data-group-id', pg.group_id);
        li.setAttribute('data-group-kind', 'project_group');
        li.className = 'flex items-center gap-2 px-3 py-1.5 mb-1 rounded-md text-sm font-bold text-green-800 cursor-pointer bg-green-50 hover:bg-green-100 hover:text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-inset border-l-2 border-green-700';
        var labelSpan = document.createElement('span');
        labelSpan.textContent = pg.group_id;
        labelSpan.className = 'flex-1 min-w-0 truncate';
        var countSpan = document.createElement('span');
        countSpan.setAttribute('aria-hidden', 'true');
        countSpan.className = 'ml-auto text-xs text-green-700 flex-shrink-0';
        countSpan.textContent = pg.sample_count.toLocaleString();
        li.appendChild(labelSpan);
        li.appendChild(countSpan);
        listEl.insertBefore(li, listEl.firstChild);
      });
    }

    function populateGroupList(listEl, items, labelKey, idKey, countKey) {
      listEl.innerHTML = '';
      items.forEach(function(item) {
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('tabindex', '0');
        li.setAttribute('aria-selected', 'false');
        li.setAttribute('data-group-id', item[idKey]);
        li.className = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-stone-600 cursor-pointer hover:bg-stone-100 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-inset';

        var labelSpan = document.createElement('span');
        labelSpan.textContent = item[labelKey];
        labelSpan.className = 'flex-1 min-w-0 truncate';

        var countSpan = document.createElement('span');
        countSpan.setAttribute('aria-hidden', 'true');
        countSpan.className = 'ml-auto text-xs text-stone-400 flex-shrink-0';
        countSpan.textContent = item[countKey] != null ? item[countKey].toLocaleString() : '';

        li.appendChild(labelSpan);
        li.appendChild(countSpan);
        listEl.appendChild(li);
      });
    }

    // =============================================================================
    // SLICE PANEL — DESTROY ALL SLICE CHART INSTANCES
    // =============================================================================

    var SLICE_CHART_KEYS = [
      'sliceProjectTypesChart',
      'sliceProjectPipelineChart',
      'sliceProjectTemporalChart',
      'sliceLocationSubsitesChart',
      'sliceLocationTypesChart',
      'sliceLocationTemporalChart',
      'sliceLocationTimeDistChart',
      'sliceLabGroupTypesChart',
      'sliceLabGroupPipelineChart',
      'sliceLabGroupTemporalChart',
      'sliceProjectReplicateBadges',
      'sliceLocationReplicateBadges',
      'sliceLabGroupReplicateBadges',
      'sliceProjectSamplerChart',
      'sliceLocationSamplerChart',
      'sliceLabGroupSamplerChart',
      'pgDailyStackChart',
      'pgSamplerMonthChart'
    ];

    function destroyAllSliceCharts() {
      SLICE_CHART_KEYS.forEach(function(key) {
        destroyChart(key);
      });
      // Phase 2: also tear down the deterministic ids the previous renderSlice pass created.
      dynamicSliceChartIds.forEach(function(key) {
        destroyChart(key);
      });
    }

    // =============================================================================
    // SLICE PANEL — SHARED TEMPORAL LINE CHART OPTIONS BUILDER
    // =============================================================================

    function buildTemporalChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: CHART_COLORS.tooltip,
            padding: 10,
            titleFont: { size: 12 },
            bodyFont: { size: 12 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: CHART_COLORS.gridLine },
            title: { display: true, text: 'Samples', color: CHART_COLORS.axisLabel, font: { size: 11 } }
          },
          x: {
            grid: { display: false },
            ticks: { maxRotation: 45, autoSkip: false, font: { size: 10 } },
            title: { display: true, text: 'Collection Date (Month/Year)', color: CHART_COLORS.axisLabel, font: { size: 11 } }
          }
        }
      };
    }

    // =============================================================================
    // SLICE PANEL — DECLARATIVE WIDGET ENGINE (Phase 2, complexity review)
    // Interprets data/project-layouts.json via one renderSlice(). computeFactsRuntime
    // and evalShowIf are 1:1 ports of compute_facts / eval_show_if in
    // scripts/build_layouts.py (see docs/WIDGET-SCHEMA.md). Keep them in lock-step.
    // =============================================================================

    function monthIdx(m) { var a = m.split('-'); return (+a[0]) * 12 + (+a[1]); }

    // 1:1 mirror of compute_facts()
    function computeFactsRuntime(p) {
      var n   = p.sample_count || 0;
      var st  = p.sample_types || [];
      var sd  = p.sampler_type_dist || [];
      var pl  = p.pipeline || {};
      var tmp = p.temporal || [];
      var tg  = p.tag_groups || {};
      var months = tmp.map(function(t) { return t.month; }).sort();   // MUST .sort() — parity item 5
      var seqIdx = months.map(monthIdx);
      var contiguous = true;
      for (var i = 0; i < seqIdx.length - 1; i++) {
        if (seqIdx[i + 1] - seqIdx[i] !== 1) { contiguous = false; break; }
      }
      var coll = pl.collected || 0, ext = pl.dna_extracted || 0, seq = pl.sequenced || 0;
      var cov = sd.reduce(function(s, x) { return s + x.count; }, 0);
      var topCount = tmp.reduce(function(mx, t) { return t.count > mx ? t.count : mx; }, 0);
      return {
        project_id: p.project_id || p.group_name || p.site_code,   // identity field across slice kinds
        sample_count: n,
        sample_types_distinct: st.length,
        samplers_distinct: sd.length,
        sampler_coverage_ratio: n ? (cov / n) : 0.0,
        months: months.length,
        contiguous: contiguous,
        top_month_share: n ? (topCount / n) : 0.0,
        collected: coll, dna_extracted: ext, sequenced: seq,
        stages_all_equal: (coll === ext && ext === seq) && n > 0,
        populated_tag_groups: Object.keys(tg).filter(function(k) {
          return !!tg[k] && Object.keys(tg[k]).length > 0;
        }),
        time_distribution_periods: (p.time_distribution || []).length,
        has_type_pipeline_crosstab: !!p.type_pipeline_crossTab
      };
    }

    // 1:1 mirror of eval_show_if()
    function evalShowIf(cond, f) {
      if (cond == null) return true;
      if (cond.all) return cond.all.every(function(c) { return evalShowIf(c, f); });
      if (cond.any) return cond.any.some(function(c) { return evalShowIf(c, f); });
      if (cond.not) return !evalShowIf(cond.not, f);
      var p = cond.predicate;
      if (p === 'always') return true;
      if (p === 'distinct_gte') {
        var key = { sample_types: 'sample_types_distinct', sampler: 'samplers_distinct' }[cond.field];
        return f[key] >= cond.value;
      }
      if (p === 'field_eq') return f[cond.field] === cond.value;
      if (p === 'field_gt') return f[cond.field] > cond.value;
      if (p === 'all_equal') return f.stages_all_equal;
      if (p === 'coverage_gte') return f.sampler_coverage_ratio >= cond.value;
      if (p === 'tag_group_nonempty') return f.populated_tag_groups.indexOf(cond.name) !== -1;
      if (p === 'months_gte') return f.months >= cond.value;
      if (p === 'contiguous_months') return f.contiguous;
      if (p === 'top_share_lt') return f.top_month_share < cond.value;
      throw new Error('unknown predicate ' + p);
    }

    // null for non-project kinds (the project-kind default references pipeline that
    // location entries lack) — keeps a future 2b branch from computing on {}.
    // Identity key per slice kind — matches both getLayoutFor and the generated/override maps.
    function keyFor(sliceKind, entry) {
      return sliceKind === 'project' ? entry.project_id
           : sliceKind === 'lab_group' ? entry.group_name
           : sliceKind === 'location' ? entry.site_code : null;
    }

    function overrideFor(sliceKind, entry) {
      var byKind = layoutOverrides && layoutOverrides.overrides && layoutOverrides.overrides[sliceKind];
      var k = keyFor(sliceKind, entry);
      return (byKind && k != null && byKind[k]) || null;
    }

    // THE single layout resolver — oracle, banner, and render all route through this so the
    // override merge has no blind spots. A hand-authored override wins as a whole descriptor.
    function getLayoutFor(sliceKind, entry) {
      if (!entry) return null;
      var ov = overrideFor(sliceKind, entry);
      if (ov) { return ov; }
      if (!projectLayouts) return null;
      if (sliceKind === 'project') {
        return projectLayouts.projects[entry.project_id] || projectLayouts.default || null;
      }
      if (sliceKind === 'lab_group') {
        return (projectLayouts.lab_groups && (projectLayouts.lab_groups[entry.group_name] || projectLayouts.lab_group_default)) || null;
      }
      if (sliceKind === 'location') {
        return (projectLayouts.locations && (projectLayouts.locations[entry.site_code] || projectLayouts.location_default)) || null;
      }
      return null;
    }

    // Subtitles preserved from the former static cards (titles come from the descriptor).
    var SLICE_WIDGET_SUBTITLE = {
      sample_types: 'Proportion of samples by material type for this project.',
      pipeline:     'Sample counts at each pipeline stage for this project.',
      temporal:     'Monthly sample collection volume for this project.'
    };

    function makeSliceCard(widget) {
      var card = document.createElement('div');
      card.className = 'bg-white p-6' + (widget.size === 'lg' ? ' lg:col-span-2' : '');
      card.id = 'chart-card-' + widget.id;
      if (widget.title) {
        var h3 = document.createElement('h3');
        h3.className = 'text-lg font-bold text-stone-800 mb-1';
        h3.textContent = widget.title;
        card.appendChild(h3);
      }
      var sub = SLICE_WIDGET_SUBTITLE[widget.id];
      if (sub) {
        var pEl = document.createElement('p');
        pEl.className = 'text-sm text-stone-500 mb-4';
        pEl.textContent = sub;
        card.appendChild(pEl);
      }
      return card;
    }

    function makeCanvas(card, id, ariaLabel) {
      var wrap = document.createElement('div');
      wrap.className = 'chart-wrap';
      var canvas = document.createElement('canvas');
      canvas.id = id;
      if (ariaLabel) { canvas.setAttribute('aria-label', ariaLabel); canvas.setAttribute('role', 'img'); }
      wrap.appendChild(canvas);
      card.appendChild(wrap);
      return canvas;
    }

    function sliceChartId(ctx, widget) { return 'slice_' + ctx.descriptor.slice_kind + '_' + widget.id; }

    // Phase 2b: building these mounts nothing now; the corresponding cards don't exist today either.
    function renderUnimplemented() { /* grouped_bar, heat_strip, link_chip, stat, tagbar */ }

    var WIDGET_RENDERERS = {
      stat_strip: function(ctx) {
        var card = makeSliceCard(ctx.widget);
        var strip = document.createElement('div');
        strip.className = 'flex flex-wrap gap-8';
        function tile(num, label) {
          var t = document.createElement('div');
          var nEl = document.createElement('div');
          nEl.className = 'text-3xl font-bold text-stone-800';
          nEl.textContent = num;
          var lEl = document.createElement('div');
          lEl.className = 'text-sm text-stone-500';
          lEl.textContent = label;
          t.appendChild(nEl); t.appendChild(lEl);
          return t;
        }
        strip.appendChild(tile(ctx.entry.sample_count.toLocaleString(), 'Samples'));
        if (ctx.facts.sample_types_distinct === 1 && ctx.entry.sample_types[0]) {
          strip.appendChild(tile(ctx.entry.sample_types[0].type, 'Sample type'));
        }
        if (ctx.facts.samplers_distinct === 1 && ctx.entry.sampler_type_dist[0]) {
          strip.appendChild(tile(ctx.entry.sampler_type_dist[0].sampler, 'Sampler'));
        }
        if (ctx.facts.collected) {   // omit the Sequenced tile entirely when there is no pipeline (e.g. locations)
          var pct = Math.round(100 * ctx.facts.sequenced / ctx.facts.collected);
          strip.appendChild(tile(pct + '%', 'Sequenced'));
        }
        card.appendChild(strip);
        ((ctx.descriptor.banner && ctx.descriptor.banner.absorbed_stats) || []).forEach(function(s) {
          var pEl = document.createElement('p');
          pEl.className = 'text-sm text-stone-500 mt-2';
          pEl.textContent = s;
          card.appendChild(pEl);
        });
        ctx.mount.appendChild(card);
      },

      completion_badge: function(ctx) {
        var card = makeSliceCard(ctx.widget);
        var n = ctx.entry.pipeline.collected;
        var badge = document.createElement('div');
        badge.className = 'flex items-center gap-2 text-emerald-700';
        var check = document.createElement('span');
        check.setAttribute('aria-hidden', 'true');
        check.textContent = '✓';
        var txt = document.createElement('span');
        txt.className = 'font-semibold';
        txt.textContent = 'Fully processed — ' + n.toLocaleString() + ' samples through all stages';
        badge.appendChild(check); badge.appendChild(txt);
        card.appendChild(badge);
        ctx.mount.appendChild(card);
      },

      doughnut: function(ctx) {
        var entry = ctx.entry;
        var card = makeSliceCard(ctx.widget);
        var id = sliceChartId(ctx, ctx.widget);
        var canvas = makeCanvas(card, id, 'Doughnut chart showing sample type breakdown for selected project');
        ctx.mount.appendChild(card);
        destroyChart(id);
        chartInstances[id] = new Chart(canvas.getContext('2d'), {
          type: 'doughnut',
          data: {
            labels: entry.sample_types.map(function(d) { return d.type; }),
            datasets: [{
              data: entry.sample_types.map(function(d) { return d.count; }),
              backgroundColor: entry.sample_types.map(function(d) { return SAMPLE_TYPE_COLORS[d.type] || SAMPLE_TYPE_COLORS['Unknown']; }),
              borderColor: CHART_COLORS.donutBorder,
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
              legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 10, font: { size: 12 } } },
              tooltip: {
                enabled: true,
                backgroundColor: CHART_COLORS.tooltip,
                callbacks: {
                  label: function(cx) { var ct = entry.type_pipeline_crossTab && entry.type_pipeline_crossTab[cx.label]; return ct ? ['Collected: '+(ct.collected||0).toLocaleString(),'Extracted: '+(ct.dna_extracted||0).toLocaleString(),'Sequenced: '+(ct.sequenced||0).toLocaleString()] : tooltipLabelPct(cx); }
                }
              }
            }
          }
        });
        dynamicSliceChartIds.push(id);
      },

      pipeline_bar: function(ctx) {
        var entry = ctx.entry;
        var card = makeSliceCard(ctx.widget);
        var id = sliceChartId(ctx, ctx.widget);
        var canvas = makeCanvas(card, id, 'Horizontal bar chart showing pipeline stage counts for selected project');
        ctx.mount.appendChild(card);
        destroyChart(id);
        chartInstances[id] = new Chart(canvas.getContext('2d'), {
          type: 'bar',
          data: {
            labels: ['Collected', 'DNA Extracted', 'Sequenced'],
            datasets: [{
              data: [entry.pipeline.collected, entry.pipeline.dna_extracted, entry.pipeline.sequenced],
              backgroundColor: CHART_COLORS.slicePipeline,
              borderWidth: 0,
              borderRadius: 4
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                enabled: true,
                backgroundColor: CHART_COLORS.tooltip,
                callbacks: {
                  label: function(cx) { var pKey={'Collected':'collected','DNA Extracted':'dna_extracted','Sequenced':'sequenced'}[cx.label]; var tl=entry.pipeline_type_crossTab&&pKey&&entry.pipeline_type_crossTab[pKey]; return tl?tl.map(function(t){return t.type+': '+t.count.toLocaleString();}):tooltipLabelSamples(cx); }
                }
              }
            },
            scales: {
              x: { beginAtZero: true, grid: { color: CHART_COLORS.gridLine }, ticks: { callback: function(val) { return val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val; } } },
              y: { grid: { display: false } }
            }
          }
        });
        dynamicSliceChartIds.push(id);
        if (ctx.facts.sequenced === 0 && ctx.widget.annotations && ctx.widget.annotations.empty_state) {
          var cap = document.createElement('p');
          cap.className = 'text-sm text-stone-500 mt-2';
          cap.textContent = ctx.widget.annotations.empty_state;
          card.appendChild(cap);
        }
      },

      temporal_bar: function(ctx) {
        var entry = ctx.entry;
        var card = makeSliceCard(ctx.widget);
        var id = sliceChartId(ctx, ctx.widget);
        var canvas = makeCanvas(card, id, 'Bar chart showing sample count over time for selected project');
        ctx.mount.appendChild(card);
        var gapped = insertGapMarkers(entry.temporal);
        destroyChart(id);
        chartInstances[id] = new Chart(canvas.getContext('2d'), {
          type: 'bar',
          data: {
            labels: gapped.labels,
            datasets: [{ label: 'Samples Collected', data: gapped.counts, backgroundColor: CHART_COLORS.sliceTemporalBar, borderWidth: 0 }]
          },
          options: (function() { var o = buildTemporalChartOptions(); o.plugins = o.plugins || {}; o.plugins.tooltip = o.plugins.tooltip || {}; o.plugins.tooltip.callbacks = { title: function(items) { return items.length ? items[0].label : ''; }, label: function(cx) { if (cx.parsed.y === null || cx.parsed.y === undefined) { return ''; } var te = (entry.temporal||[]).find(function(t){return t.month===cx.label;}); return te && te.types && te.types.length ? te.types.map(function(t){return t.type+': '+t.count.toLocaleString();}) : (te ? te.count.toLocaleString()+' samples' : cx.parsed.y.toLocaleString()+' samples'); } }; return o; }())
        });
        dynamicSliceChartIds.push(id);
      },

      bar: function(ctx) {
        var src = ctx.widget.data_binding && ctx.widget.data_binding.source;
        // tag_groups.<dim> binding (height_bar / position_bar): linear vertical bar of token counts.
        if (src && src.indexOf('tag_groups.') === 0) {
          var grp = src.slice('tag_groups.'.length);
          var dict = ctx.entry.tag_groups && ctx.entry.tag_groups[grp];
          if (!dict || !Object.keys(dict).length) { return; }
          var keys = Object.keys(dict);
          if (ctx.widget.data_binding.transform === 'sort_desc') { keys.sort(function(a, b) { return dict[b] - dict[a]; }); }
          var tgCard = makeSliceCard(ctx.widget);
          var tgId = sliceChartId(ctx, ctx.widget);
          var tgCanvas = makeCanvas(tgCard, tgId, 'Bar chart of ' + (ctx.widget.title || grp) + ' counts');
          ctx.mount.appendChild(tgCard);
          destroyChart(tgId);
          chartInstances[tgId] = new Chart(tgCanvas.getContext('2d'), {
            type: 'bar',
            data: { labels: keys, datasets: [{ data: keys.map(function(k) { return dict[k]; }), backgroundColor: Object.values(SAMPLE_TYPE_COLORS) }] },
            options: {
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { backgroundColor: CHART_COLORS.tooltip, callbacks: { label: function(cx) { return ' ' + cx.parsed.y.toLocaleString() + ' samples'; } } } },
              scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { beginAtZero: true, grid: { color: CHART_COLORS.gridLine } } }  // linear (counts can be tiny)
            }
          });
          dynamicSliceChartIds.push(tgId);
          return;
        }
        // sampler binding is the only other supported source; all else no-op.
        if (src !== 'sampler_type_dist') { return; }
        var entry = ctx.entry;
        var card = makeSliceCard(ctx.widget);
        var id = sliceChartId(ctx, ctx.widget);
        makeCanvas(card, id, 'Bar chart showing sampler type breakdown for selected project');
        ctx.mount.appendChild(card);
        renderSamplerTypeChart(id, entry.sampler_type_dist);   // reuses log-scale + zero/no-data guards
        var sc = chartInstances[id];
        if (sc) {
          var lbl = entry[ctx.labelField];
          sc.options.plugins.tooltip.callbacks.label = function(cx) { return cx.parsed.y.toLocaleString() + ' samples' + (lbl ? ' in ' + lbl : ''); };
          sc.update('none');
        }
        dynamicSliceChartIds.push(id);
        if (ctx.widget.annotations && ctx.widget.annotations.unspecified_remainder && ctx.facts.sampler_coverage_ratio < 1) {
          var unspec = ctx.entry.sample_count - Math.round(ctx.facts.sampler_coverage_ratio * ctx.entry.sample_count);
          if (unspec > 0) {
            var cap = document.createElement('p');
            cap.className = 'text-sm text-stone-500 mt-2';
            cap.textContent = unspec.toLocaleString() + ' samples have no sampler recorded.';
            card.appendChild(cap);
          }
        }
      },

      badge_row: function(ctx) {
        var card = makeSliceCard(ctx.widget);
        var container = document.createElement('div');
        container.id = 'slice_' + ctx.descriptor.slice_kind + '_tags';
        container.className = 'flex flex-wrap gap-2';
        card.appendChild(container);
        ctx.mount.appendChild(card);
        renderTagGroups(container.id, ctx.entry.tag_groups);   // preserves badge click -> filterState.tags
      },

      caption: function(ctx) {
        var card = makeSliceCard(ctx.widget);
        var pEl = document.createElement('p');
        pEl.className = 'text-sm text-stone-500';
        pEl.textContent = (ctx.widget.annotations && ctx.widget.annotations.caption) || ctx.widget.title || '';
        card.appendChild(pEl);
        ctx.mount.appendChild(card);
      },

      grouped_bar: function(ctx) {
        var src = ctx.widget.data_binding && ctx.widget.data_binding.source;
        var rows = [];   // [{label, collected, dna_extracted, sequenced}]
        if (src === 'type_pipeline_crossTab') {
          var tab = ctx.entry.type_pipeline_crossTab || {};
          rows = Object.keys(tab).map(function(k) { var v = tab[k] || {}; return { label: k, collected: v.collected || 0, dna_extracted: v.dna_extracted || 0, sequenced: v.sequenced || 0 }; });
        } else if (src && src.indexOf('tag_charts.') === 0) {
          var nm = src.split('.').pop();
          var chart = (ctx.entry.tag_charts && ctx.entry.tag_charts[nm]) || {};
          rows = Object.keys(chart).map(function(k) { var pl = (chart[k] && chart[k].pipeline) || {}; return { label: k, collected: pl.collected || 0, dna_extracted: pl.dna_extracted || 0, sequenced: pl.sequenced || 0 }; });
        } else if (src === 'sampler_pipeline') {
          var sp = ctx.entry.sampler_pipeline || {};
          rows = Object.keys(sp).map(function(k) { var v = sp[k] || {}; return { label: k, collected: v.collected || 0, dna_extracted: v.dna_extracted || 0, sequenced: v.sequenced || 0 }; });
        } else if (src === 'sampler_type_dist') {
          return;   // legacy no-op: the per-sampler funnel now lives under the 'sampler_pipeline' source
        } else { return; }
        if (!rows.length) { return; }
        var card = makeSliceCard(ctx.widget);
        var id = sliceChartId(ctx, ctx.widget);
        var canvas = makeCanvas(card, id, 'Grouped bar of pipeline stages by ' + (ctx.widget.title || 'category'));
        ctx.mount.appendChild(card);
        // GROUPED (not stacked): the three stages are nested subsets, so stacking would mislead.
        var stages = [
          { key: 'collected', label: 'Collected', color: CHART_COLORS.pipeline[0] },
          { key: 'dna_extracted', label: 'DNA Extracted', color: CHART_COLORS.pipeline[1] },
          { key: 'sequenced', label: 'Sequenced', color: CHART_COLORS.pipeline[2] }
        ];
        destroyChart(id);
        chartInstances[id] = new Chart(canvas.getContext('2d'), {
          type: 'bar',
          data: {
            labels: rows.map(function(r) { return r.label; }),
            datasets: stages.map(function(s) { return { label: s.label, data: rows.map(function(r) { return r[s.key]; }), backgroundColor: s.color, borderWidth: 0 }; })
          },
          options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
              tooltip: { backgroundColor: CHART_COLORS.tooltip, callbacks: { label: function(cx) { return ' ' + cx.dataset.label + ': ' + cx.parsed.x.toLocaleString(); } } }
            },
            scales: { x: { beginAtZero: true, grid: { color: CHART_COLORS.gridLine } }, y: { grid: { display: false } } }
          }
        });
        dynamicSliceChartIds.push(id);
      },

      heat_strip: function(ctx) {
        var src = ctx.widget.data_binding && ctx.widget.data_binding.source;
        var nm = (src && src.indexOf('.') >= 0) ? src.split('.').pop() : 'Quadrant';
        var chart = ctx.entry.tag_charts && ctx.entry.tag_charts[nm];
        if (!chart) { return; }
        var keys = Object.keys(chart).sort(function(a, b) { return parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10); });  // Q1,Q2,..Q12 numeric
        if (!keys.length) { return; }
        var card = makeSliceCard(ctx.widget);
        var gridEl = document.createElement('div');
        gridEl.className = 'grid grid-cols-4 sm:grid-cols-6 gap-2';
        keys.forEach(function(k) {
          var pl = (chart[k] && chart[k].pipeline) || {};
          var coll = pl.collected || 0, seq = pl.sequenced || 0;
          var pct = coll ? Math.round(100 * seq / coll) : 0;
          var bucket = pct === 0 ? 0 : (pct <= 33 ? 1 : (pct <= 66 ? 2 : 3));
          var cell = document.createElement('div');
          cell.className = 'rounded p-2 text-center';
          cell.style.backgroundColor = CHART_COLORS.sliceHeatRamp[bucket];
          cell.style.color = bucket >= 2 ? '#ffffff' : '#14532d';   // WCAG-AA on each ramp stop
          cell.setAttribute('title', k + ': ' + pct + '% sequenced (' + seq + ' of ' + coll + ')');
          cell.setAttribute('aria-label', k + ': ' + pct + ' percent sequenced, ' + seq + ' of ' + coll + ' samples');
          var kEl = document.createElement('div'); kEl.className = 'text-xs font-semibold'; kEl.textContent = k;
          var pEl = document.createElement('div'); pEl.className = 'text-sm font-bold'; pEl.textContent = pct + '%';
          cell.appendChild(kEl); cell.appendChild(pEl);
          gridEl.appendChild(cell);
        });
        card.appendChild(gridEl);
        ctx.mount.appendChild(card);   // pure DOM — no canvas, not pushed to dynamicSliceChartIds
      },

      link_chip: function(ctx) {
        var content = PROJECT_CONTENT[ctx.entry[ctx.keyField]];
        var links = content && content.links;
        if (!links || !links.length) { return; }   // no_fabricate: nothing renders without real links
        var card = makeSliceCard(ctx.widget);
        var row = document.createElement('div');
        row.className = 'flex flex-wrap gap-2';
        links.forEach(function(lk) { row.appendChild(makeLinkChip(lk)); });
        card.appendChild(row);
        ctx.mount.appendChild(card);
      },

      sub_sites: function(ctx) {
        var entry = ctx.entry;
        if (!entry.sub_sites || !entry.sub_sites.length) { return; }
        var card = makeSliceCard(ctx.widget);
        var id = sliceChartId(ctx, ctx.widget);
        var canvas = makeCanvas(card, id, 'Horizontal bar chart of sub-location sample counts');
        ctx.mount.appendChild(card);
        destroyChart(id);
        chartInstances[id] = new Chart(canvas.getContext('2d'), {
          type: 'bar',
          data: { labels: entry.sub_sites.map(function(d) { return d.sub_name; }), datasets: [{ data: entry.sub_sites.map(function(d) { return d.count; }), backgroundColor: CHART_COLORS.sliceLocationBar, borderWidth: 0, borderRadius: 3 }] },
          options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { backgroundColor: CHART_COLORS.tooltip, callbacks: { label: tooltipLabelSamples } } },
            scales: { x: { beginAtZero: true, grid: { color: CHART_COLORS.gridLine }, ticks: { callback: function(val) { return val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val; } } }, y: { grid: { display: false }, ticks: { font: { size: 10 } } } }
          }
        });
        dynamicSliceChartIds.push(id);
      },

      time_of_day: function(ctx) {
        var entry = ctx.entry;
        if (!entry.time_distribution || !entry.time_distribution.length) { return; }
        var card = makeSliceCard(ctx.widget);
        var id = sliceChartId(ctx, ctx.widget);
        var canvas = makeCanvas(card, id, 'Bar chart of sample counts by time of day');
        ctx.mount.appendChild(card);
        destroyChart(id);
        chartInstances[id] = new Chart(canvas.getContext('2d'), {
          type: 'bar',
          data: { labels: entry.time_distribution.map(function(d) { return d.time_period; }), datasets: [{ data: entry.time_distribution.map(function(d) { return d.count; }), backgroundColor: CHART_COLORS.sliceTimeOfDay, borderWidth: 0 }] },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { backgroundColor: CHART_COLORS.tooltip, callbacks: { label: function(cx) { return ' ' + cx.label + ': ' + cx.parsed.y.toLocaleString() + ' samples'; } } } },
            scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } }, title: { display: true, text: 'Time Period', color: CHART_COLORS.axisLabel, font: { size: 11 } } }, y: { beginAtZero: true, grid: { color: CHART_COLORS.gridLine }, title: { display: true, text: 'Samples', color: CHART_COLORS.axisLabel, font: { size: 11 } } } }
          }
        });
        dynamicSliceChartIds.push(id);
      },

      stat: renderUnimplemented   // control_callout — deferred (out of 2b scope)
    };

    // Render one slice from its LayoutDescriptor. Previous pass's charts are torn down by
    // destroyAllSliceCharts() at the top of renderView() before this runs.
    function renderSlice(descriptor, entry, gridEl) {
      hideSliceNoData(gridEl);
      gridEl.innerHTML = '';
      dynamicSliceChartIds = [];
      // DESIGN MODE: when editing the active slice, render the editable WORKING COPY, show ALL
      // widgets (ignoring show_if so suppressed ones can still be arranged), and decorate cards.
      var editing = DESIGN_MODE && isActiveDesignSlice(descriptor.slice_kind, entry);
      if (editing) {
        descriptor = getWorkingCopyOrSeed(descriptor.slice_kind, keyFor(descriptor.slice_kind, entry), descriptor);
        editorState.activeSlice.working = descriptor;
        editorState.activeSlice.entry = entry;
        editorState.activeSlice.gridEl = gridEl;
      }
      var facts = computeFactsRuntime(entry);
      descriptor.widgets.forEach(function(widget, idx) {
        try {
          var ok = evalShowIf(widget.show_if || null, facts);
          if (!editing && !ok) { return; }   // PUBLISHED path: byte-identical to pre-design behavior
          var before = gridEl.children.length;
          var fn = WIDGET_RENDERERS[widget.type] || renderUnimplemented;
          fn({ descriptor: descriptor, entry: entry, facts: facts, widget: widget,
               mount: gridEl, keyField: descriptor.slice_key_field, labelField: descriptor.slice_label_field });
          if (editing) { decorateCardsForDesign(gridEl, before, idx, descriptor.widgets.length, ok); }
        } catch (e) {
          if (window.console) { console.warn('renderSlice widget failed:', widget.id, e); }
        }
      });
      if (editing) { ensureDesignToolbar(); }
    }

    // Dev-only parity oracle (no effect on normal load): load index.html?verifyLayouts and
    // diff the logged grid against `python3 scripts/build_layouts.py visibility`.
    function verifyLayoutsOracle() {
      if (!projectLayouts || !appData || !appData.slice_views) { return; }
      var grid = {};
      function addKind(entries, sliceKind, idField) {
        (entries || []).forEach(function(entry) {
          var desc = getLayoutFor(sliceKind, entry);   // single resolution path (override-aware)
          if (!desc) { return; }
          var facts = computeFactsRuntime(entry);
          grid[entry[idField]] = desc.widgets.filter(function(w) { return evalShowIf(w.show_if || null, facts); }).map(function(w) { return w.id; });
        });
      }
      addKind(appData.slice_views.project, 'project', 'project_id');
      addKind(appData.slice_views.lab_group, 'lab_group', 'group_name');
      addKind(appData.slice_views.location, 'location', 'site_code');
      console.log('VERIFY_LAYOUTS_RUNTIME_GRID ' + JSON.stringify(grid));
    }

    // =============================================================================
    // DESIGNER MODE (Phase 3) — entirely gated behind DESIGN_MODE (?design exact token).
    // Reorder/resize/hide/add widgets on the active slice; export data/layout-overrides.json.
    // Inert and invisible for normal visitors (no toolbar, no listeners, no storage writes).
    // =============================================================================

    var DESIGN_DRAFT_PREFIX = 'broadn:layout-draft:v1:';
    var SIZE_CYCLE = { sm: 'md', md: 'lg', lg: 'sm' };
    var REPEATABLE_TYPES = { caption: true };
    var EXPORT_WIDGET_FIELDS = ['id', 'type', 'title', 'size', 'binds_entry', 'show_if', 'data_binding', 'annotations'];
    var EXPORT_DESC_FIELDS = ['slice_kind', 'slice_key_field', 'slice_label_field', 'banner', 'widgets'];

    function deepClone(o) { return (typeof structuredClone === 'function') ? structuredClone(o) : JSON.parse(JSON.stringify(o)); }
    function sliceTag(kind, key) { return kind + '::' + key; }

    function setActiveDesignSlice(kind, entry, gridEl) {
      editorState.activeSlice = { kind: kind, key: keyFor(kind, entry), entry: entry, gridEl: gridEl };
    }
    function isActiveDesignSlice(kind, entry) {
      var a = editorState.activeSlice;
      return !!(a && a.kind === kind && a.key === keyFor(kind, entry));
    }

    function draftKey(kind, key) { return DESIGN_DRAFT_PREFIX + kind + ':' + key; }
    function loadDraft(kind, key) {
      try { var s = window.localStorage.getItem(draftKey(kind, key)); return s ? JSON.parse(s) : null; } catch (e) { return null; }
    }
    function saveDraft(kind, key, descriptor) {
      try { window.localStorage.setItem(draftKey(kind, key), JSON.stringify(descriptor)); announce('Draft saved'); } catch (e) { /* storage off — non-fatal */ }
    }
    function clearDraft(kind, key) { try { window.localStorage.removeItem(draftKey(kind, key)); } catch (e) {} }

    // Generated (override-bypassing) layout — used by Revert.
    function generatedLayoutFor(kind, entry) {
      if (!projectLayouts) return null;
      if (kind === 'project') return projectLayouts.projects[entry.project_id] || projectLayouts.default || null;
      if (kind === 'lab_group') return (projectLayouts.lab_groups && (projectLayouts.lab_groups[entry.group_name] || projectLayouts.lab_group_default)) || null;
      if (kind === 'location') return (projectLayouts.locations && (projectLayouts.locations[entry.site_code] || projectLayouts.location_default)) || null;
      return null;
    }

    function getWorkingCopyOrSeed(kind, key, resolvedDescriptor) {
      var sk = sliceTag(kind, key);
      if (!editorState.working[sk]) {
        editorState.working[sk] = loadDraft(kind, key) || deepClone(resolvedDescriptor);
      }
      return editorState.working[sk];
    }
    function activeWorking() {
      var a = editorState.activeSlice;
      return a && editorState.working[sliceTag(a.kind, a.key)];
    }
    function reRenderActiveSlice() {
      var a = editorState.activeSlice;
      if (!a) return;
      destroyAllSliceCharts();
      renderSlice(a.working, a.entry, a.gridEl);
    }
    function persistAndRerender() {
      var a = editorState.activeSlice;
      if (!a) return;
      saveDraft(a.kind, a.key, a.working);
      reRenderActiveSlice();
    }

    // edit operations on the active working descriptor
    function moveWidget(idx, dir) {
      var w = activeWorking(); if (!w) return;
      var j = idx + dir; if (j < 0 || j >= w.widgets.length) return;
      var t = w.widgets[idx]; w.widgets[idx] = w.widgets[j]; w.widgets[j] = t;
      announce('Moved ' + (dir < 0 ? 'up' : 'down')); persistAndRerender();
    }
    function cycleSize(idx) {
      var w = activeWorking(); if (!w) return;
      w.widgets[idx].size = SIZE_CYCLE[w.widgets[idx].size || 'md'] || 'md';
      announce('Size now ' + w.widgets[idx].size); persistAndRerender();
    }
    function removeWidget(idx) {
      var w = activeWorking(); if (!w) return;
      var a = editorState.activeSlice; var sk = sliceTag(a.kind, a.key);
      editorState.removed[sk] = editorState.removed[sk] || [];
      editorState.removed[sk].push(w.widgets[idx]);
      w.widgets.splice(idx, 1);
      announce('Widget hidden'); persistAndRerender();
    }
    function nextWidgetId(w, type) {
      var taken = {}; w.widgets.forEach(function(x) { taken[x.id] = true; });
      var a = editorState.activeSlice;
      (editorState.removed[sliceTag(a.kind, a.key)] || []).forEach(function(x) { taken[x.id] = true; });
      var n = 1, id; do { id = type + '_' + n; n++; } while (taken[id]);
      return id;
    }
    function addWidget(template) {
      var w = activeWorking(); if (!w) return;
      var widget = deepClone(template);
      if (!widget.id || w.widgets.some(function(x) { return x.id === widget.id; })) { widget.id = nextWidgetId(w, widget.type); }
      w.widgets.push(widget);
      announce('Added ' + (widget.title || widget.type)); persistAndRerender();
    }
    function revertToGenerated() {
      var a = editorState.activeSlice; if (!a) return;
      clearDraft(a.kind, a.key);
      var gen = generatedLayoutFor(a.kind, a.entry);
      editorState.working[sliceTag(a.kind, a.key)] = gen ? deepClone(gen) : null;
      editorState.removed[sliceTag(a.kind, a.key)] = [];
      announce('Reverted to generated layout'); reRenderActiveSlice();
    }

    // export — freeze kept widgets to always (on a clone; working keeps real show_if for revert)
    function captureOverride(workingDescriptor) {
      var clone = deepClone(workingDescriptor);
      clone.widgets = clone.widgets.map(function(w) {
        var out = {}; EXPORT_WIDGET_FIELDS.forEach(function(f) { if (w[f] !== undefined) out[f] = w[f]; });
        out.show_if = { predicate: 'always' };
        return out;
      });
      var desc = {}; EXPORT_DESC_FIELDS.forEach(function(f) { if (clone[f] !== undefined) desc[f] = clone[f]; });
      return desc;
    }
    function buildExportPayload() {
      var payload = (layoutOverrides && deepClone(layoutOverrides)) || { version: '1.0.0', overrides: {} };
      payload.version = payload.version || '1.0.0';
      payload.generated_by = 'designer-mode (manual export)';
      payload.overrides = payload.overrides || {};
      Object.keys(editorState.working).forEach(function(sk) {
        var working = editorState.working[sk]; if (!working) return;
        var parts = sk.split('::'); var kind = parts[0]; var key = parts.slice(1).join('::');
        payload.overrides[kind] = payload.overrides[kind] || {};
        payload.overrides[kind][key] = captureOverride(working);
      });
      return payload;
    }
    function downloadExport() {
      var blob = new Blob([JSON.stringify(buildExportPayload(), null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'layout-overrides.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
      announce('Exported layout-overrides.json — drop it into data/ and commit to publish');
    }

    // add-widget palette per kind (location excludes pipeline-derived widgets, matching the generator)
    function paletteWidget(type, source, extra) {
      var w = { id: type, type: type, show_if: { predicate: 'always' }, size: 'md' };
      if (source) { w.data_binding = { source: source }; }
      if (extra) { Object.keys(extra).forEach(function(k) { w[k] = extra[k]; }); }
      return w;
    }
    var PALETTE_CATALOG = {
      project: [
        paletteWidget('stat_strip', 'sample_count', { title: 'At a glance' }),
        paletteWidget('doughnut', 'sample_types', { title: 'Sample Types' }),
        paletteWidget('pipeline_bar', 'pipeline', { title: 'Processing Pipeline' }),
        paletteWidget('completion_badge', 'pipeline', { title: 'Fully processed', size: 'sm' }),
        paletteWidget('temporal_bar', 'temporal', { title: 'Collection Over Time' }),
        paletteWidget('bar', 'sampler_type_dist', { title: 'Sampler Types' }),
        paletteWidget('grouped_bar', 'type_pipeline_crossTab', { title: 'Pipeline by Substrate' }),
        paletteWidget('heat_strip', 'tag_charts.Quadrant', { title: 'Quadrant Gradient', size: 'lg' }),
        paletteWidget('badge_row', 'tag_groups', { title: 'Replicate & Design Tags', size: 'sm' }),
        paletteWidget('link_chip', 'PROJECT_CONTENT.publications', { title: 'Publications & Data', size: 'sm' }),
        paletteWidget('caption', null, { title: 'Caption', size: 'sm', annotations: { caption: 'Edit me' } })
      ],
      lab_group: [
        paletteWidget('stat_strip', 'sample_count', { title: 'At a glance' }),
        paletteWidget('doughnut', 'sample_types', { title: 'Sample Types' }),
        paletteWidget('pipeline_bar', 'pipeline', { title: 'Processing Pipeline' }),
        paletteWidget('completion_badge', 'pipeline', { title: 'Fully processed', size: 'sm' }),
        paletteWidget('temporal_bar', 'temporal', { title: 'Collection Over Time' }),
        paletteWidget('bar', 'sampler_type_dist', { title: 'Sampler Types' }),
        paletteWidget('grouped_bar', 'type_pipeline_crossTab', { title: 'Pipeline by Substrate' }),
        paletteWidget('badge_row', 'tag_groups', { title: 'Replicate & Design Tags', size: 'sm' }),
        paletteWidget('caption', null, { title: 'Caption', size: 'sm', annotations: { caption: 'Edit me' } })
      ],
      location: [
        paletteWidget('stat_strip', 'sample_count', { title: 'At a glance' }),
        paletteWidget('sub_sites', 'sub_sites', { title: 'Sub-Locations' }),
        paletteWidget('doughnut', 'sample_types', { title: 'Sample Types' }),
        paletteWidget('temporal_bar', 'temporal', { title: 'Collection Over Time' }),
        paletteWidget('bar', 'sampler_type_dist', { title: 'Sampler Types' }),
        paletteWidget('badge_row', 'tag_groups', { title: 'Replicate & Design Tags', size: 'sm' }),
        paletteWidget('time_of_day', 'time_distribution', { title: 'Time of Day' }),
        paletteWidget('caption', null, { title: 'Caption', size: 'sm', annotations: { caption: 'Edit me' } })
      ]
    };
    function availablePalette() {
      var a = editorState.activeSlice; if (!a) return [];
      var w = activeWorking(); var present = {};
      (w ? w.widgets : []).forEach(function(x) { present[x.type] = true; });
      var items = (PALETTE_CATALOG[a.kind] || []).filter(function(t) { return REPEATABLE_TYPES[t.type] || !present[t.type]; });
      (editorState.removed[sliceTag(a.kind, a.key)] || []).forEach(function(rw) {
        items.push({ __readd: true, type: rw.type, title: 'Re-add: ' + (rw.title || rw.type), __orig: rw });
      });
      return items;
    }

    function announce(msg) { var live = document.getElementById('design-status'); if (live) { live.textContent = msg; } }
    function designBtn(label, aria, onClick) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'design-btn'; b.textContent = label;
      b.setAttribute('aria-label', aria); b.addEventListener('click', onClick);
      return b;
    }
    function ensureDesignToolbar() {
      if (document.getElementById('design-toolbar')) { rebuildPalette(); return; }
      var container = document.getElementById('slice-view-container'); if (!container) return;
      var bar = document.createElement('div');
      bar.id = 'design-toolbar'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Designer mode controls');
      var title = document.createElement('span'); title.className = 'design-toolbar-title'; title.textContent = 'Designer mode'; bar.appendChild(title);
      var help = document.createElement('span'); help.className = 'design-toolbar-help';
      help.textContent = 'Arrange widgets; dimmed = hidden for this slice’s data. Save freezes your visible set as the published layout.';
      bar.appendChild(help);
      var addWrap = document.createElement('span'); addWrap.className = 'design-add-wrap';
      var sel = document.createElement('select'); sel.id = 'design-add-select'; sel.setAttribute('aria-label', 'Choose a widget to add'); addWrap.appendChild(sel);
      addWrap.appendChild(designBtn('+ Add', 'Add the selected widget', function() {
        var v = document.getElementById('design-add-select').value; if (v === '') return;
        var items = availablePalette(); var pick = items[parseInt(v, 10)]; if (!pick) return;
        addWidget(pick.__readd ? pick.__orig : pick);
        if (pick.__readd) {
          var a = editorState.activeSlice; var sk = sliceTag(a.kind, a.key);
          editorState.removed[sk] = (editorState.removed[sk] || []).filter(function(x) { return x !== pick.__orig; });
        }
      }));
      bar.appendChild(addWrap);
      bar.appendChild(designBtn('Save as final', 'Export layout-overrides.json to commit', downloadExport));
      bar.appendChild(designBtn('Revert', 'Revert this slice to the generated layout', revertToGenerated));
      bar.appendChild(designBtn('Exit', 'Exit designer mode', function() { window.location = window.location.pathname; }));
      var live = document.createElement('span'); live.id = 'design-status'; live.className = 'design-status'; live.setAttribute('aria-live', 'polite'); bar.appendChild(live);
      container.insertBefore(bar, container.firstChild);
      rebuildPalette();
    }
    function rebuildPalette() {
      var sel = document.getElementById('design-add-select'); if (!sel) return;
      sel.innerHTML = '';
      var items = availablePalette();
      var ph = document.createElement('option'); ph.value = ''; ph.textContent = items.length ? 'Add widget…' : '(all widgets present)'; sel.appendChild(ph);
      items.forEach(function(t, i) { var o = document.createElement('option'); o.value = String(i); o.textContent = t.title || t.type; sel.appendChild(o); });
    }
    function decorateCardsForDesign(gridEl, before, idx, total, ok) {
      var card = gridEl.children[before];
      if (!card) {
        // renderer emitted no DOM (data-blocked / empty binding) — inject a placeholder so it stays controllable
        card = document.createElement('div'); card.className = 'bg-white p-6 design-placeholder';
        var wd0 = activeWorking(); var wd = wd0 && wd0.widgets[idx];
        card.textContent = '(' + ((wd && (wd.title || wd.type)) || 'widget') + ' — no output for this slice)';
        gridEl.appendChild(card);
      }
      for (var c = before + 1; c < gridEl.children.length; c++) {
        gridEl.children[c].setAttribute('aria-hidden', 'true');
        gridEl.children[c].classList.add('design-continuation');
      }
      card.classList.add('design-card');
      if (!ok) {
        card.classList.add('design-suppressed');
        var badge = document.createElement('div'); badge.className = 'design-suppressed-badge'; badge.textContent = 'hidden for this slice’s data';
        card.insertBefore(badge, card.firstChild);
      }
      var w = activeWorking(); var widget = w && w.widgets[idx];
      var label = (widget && (widget.title || widget.type)) || 'widget';
      var controls = document.createElement('div'); controls.className = 'design-controls'; controls.setAttribute('role', 'group'); controls.setAttribute('aria-label', 'Controls for ' + label);
      controls.appendChild(designBtn('↑', 'Move ' + label + ' up', function() { moveWidget(idx, -1); }));
      controls.appendChild(designBtn('↓', 'Move ' + label + ' down', function() { moveWidget(idx, 1); }));
      controls.appendChild(designBtn('⤢ ' + ((widget && widget.size) || 'md'), 'Cycle size of ' + label + ', currently ' + ((widget && widget.size) || 'md'), function() { cycleSize(idx); }));
      controls.appendChild(designBtn('✕', 'Hide ' + label, function() { removeWidget(idx); }));
      card.insertBefore(controls, card.firstChild);
    }
    function wireDesignMode() {
      document.body.classList.add('design-mode-active');
      if (editorState.activeSlice && editorState.activeSlice.gridEl) { reRenderActiveSlice(); }
      announce('Designer mode active — open a slice from the sidebar to edit it');
    }

    // =============================================================================
    // SLICE PANEL — NO-DATA FALLBACK HELPER
    // =============================================================================

    function showSliceNoData(gridEl, message) {
      gridEl.classList.add('hidden');
      var existing = gridEl.parentNode.querySelector('.slice-no-data-msg');
      if (!existing) {
        var p = document.createElement('p');
        p.className = 'slice-no-data-msg py-12 text-center text-stone-500 text-sm';
        p.textContent = message;
        gridEl.parentNode.insertBefore(p, gridEl);
      } else {
        existing.textContent = message;
        existing.classList.remove('hidden');
      }
    }

    function hideSliceNoData(gridEl) {
      gridEl.classList.remove('hidden');
      var existing = gridEl.parentNode.querySelector('.slice-no-data-msg');
      if (existing) {
        existing.classList.add('hidden');
      }
    }

    // =============================================================================
    // SLICE PANEL — PROJECT GROUP VIEW RENDERER (custom CPER page)
    // =============================================================================

    // PG_TYPE_COLOR — timeline strip hex color for concurrent sub-project bars.
    // Sourced from SAMPLE_TYPE_COLORS (Okabe-Ito palette, keyed by name).
    // The old bg-sky/emerald/amber/cyan Tailwind classes are RETIRED per DESIGN.md v2 § Migration Table E.
    // Consumer sets bar.style.background from this map (not bar.className).
    var PG_TYPE_COLOR = {
      'Air':    SAMPLE_TYPE_COLORS['Air'],
      'Plant':  SAMPLE_TYPE_COLORS['Plant'],
      'Soil':   SAMPLE_TYPE_COLORS['Soil'],
      'Liquid': SAMPLE_TYPE_COLORS['Liquid']
    };

    function renderProjectGroupView(groupId) {
      if (!appData.slice_views || !appData.slice_views.project_group) return;
      var entry = appData.slice_views.project_group.find(function(e) { return e.group_id === groupId; });
      if (!entry) return;

      // Header stats
      document.getElementById('pg-title').textContent = entry.group_id;
      var sites = Object.keys(entry.site_breakdown || {});
      var siteSummary = sites.length ? sites.join(' + ') : '—';
      document.getElementById('pg-subtitle').textContent =
        'Cross-project program — concurrent collections at ' + siteSummary + ', ' +
        (entry.date_range.first || '?').slice(0, 4) + '–' + (entry.date_range.last || '?').slice(0, 4);
      document.getElementById('pg-daterange').textContent =
        (entry.date_range.first || '—') + '  →  ' + (entry.date_range.last || '—');
      document.getElementById('pg-stat-samples').textContent = entry.sample_count.toLocaleString();
      document.getElementById('pg-stat-subprojects').textContent = entry.sub_projects.length;
      document.getElementById('pg-stat-dna').textContent = entry.pipeline.dna_extracted.toLocaleString();
      document.getElementById('pg-stat-seq').textContent = entry.pipeline.sequenced.toLocaleString();

      // Timeline strip
      renderPgTimeline(entry);

      // Time-series exploration plots
      renderPgDailyStack(entry.daily_breakdown);
      renderPgCadence(entry.daily_breakdown);
      renderPgSamplerMonth(entry.monthly_sampler);
      renderPgDiurnal(entry.daily_breakdown);

      // Collection matrix
      renderPgMatrix(entry.collection_matrix);

      // Freezer inventory
      var fi = entry.freezer_inventory;
      document.getElementById('pg-freezer-available').textContent = fi.with_filter.toLocaleString();
      document.getElementById('pg-freezer-depleted').textContent = fi.depleted.toLocaleString();
      document.getElementById('pg-freezer-unrecorded').textContent = fi.unrecorded.toLocaleString();
      var freezerByValue = document.getElementById('pg-freezer-byvalue');
      freezerByValue.innerHTML = '';
      Object.keys(fi.by_value).forEach(function(v) {
        var pill = document.createElement('span');
        pill.className = 'inline-flex items-center gap-1 px-2 py-1 text-xs bg-stone-100 text-stone-700 rounded';
        pill.textContent = v + ': ' + fi.by_value[v];
        freezerByValue.appendChild(pill);
      });

      // Position breakdown
      var posEl = document.getElementById('pg-position');
      posEl.innerHTML = '';
      Object.keys(entry.position_breakdown).forEach(function(k) {
        var pill = document.createElement('span');
        pill.className = 'inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-800 rounded border border-green-200';
        pill.textContent = k + ': ' + entry.position_breakdown[k];
        posEl.appendChild(pill);
      });

      // Site breakdown
      var sitesEl = document.getElementById('pg-sites');
      sitesEl.innerHTML = '';
      Object.keys(entry.site_breakdown).forEach(function(k) {
        var pill = document.createElement('span');
        pill.className = 'inline-flex items-center gap-1 px-2 py-1 text-xs bg-stone-100 text-stone-700 rounded';
        pill.textContent = k + ': ' + entry.site_breakdown[k].toLocaleString();
        sitesEl.appendChild(pill);
      });

      // Sub-project drilldown list
      renderPgSubprojects(entry);
    }

    // CPER Plot 1: Daily Activity Stack (Chart.js stacked bar)
    // PG_TYPE_FILL — hex fills for the daily stacked bar chart and cadence heatmap.
    // Sourced from SAMPLE_TYPE_COLORS (Okabe-Ito, keyed by name) per DESIGN.md v2 § Migration Table F.
    // Legacy sky-500/emerald-600/amber-700/cyan-400 values are RETIRED.
    var PG_TYPE_FILL = {
      'Air':    SAMPLE_TYPE_COLORS['Air'],    // Okabe #0072B2 (v2 Okabe blue)
      'Plant':  SAMPLE_TYPE_COLORS['Plant'],  // Okabe #009E73 (v2 Okabe teal-green)
      'Soil':   SAMPLE_TYPE_COLORS['Soil'],   // Okabe #E69F00 (was amber-700 #b45309 — data use, not warning)
      'Liquid': SAMPLE_TYPE_COLORS['Liquid']  // Okabe #56B4E9 (was cyan-400)
    };

    function renderPgDailyStack(daily) {
      destroyChart('pgDailyStackChart');
      var canvas = document.getElementById('pgDailyStackChart');
      if (!canvas || !daily || daily.length === 0) return;
      var labels = daily.map(function(d) { return d.date; });
      var typeOrder = ['Air', 'Plant', 'Soil', 'Liquid'];
      // Include any types observed beyond the default 4
      daily.forEach(function(d) {
        Object.keys(d.by_type).forEach(function(t) { if (typeOrder.indexOf(t) === -1) typeOrder.push(t); });
      });
      var datasets = typeOrder.map(function(t) {
        return {
          label: t,
          data: daily.map(function(d) { return d.by_type[t] || 0; }),
          backgroundColor: PG_TYPE_FILL[t] || '#78716c',
          borderWidth: 0,
          stack: 'samples'
        };
      });
      chartInstances['pgDailyStackChart'] = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: { labels: labels, datasets: datasets },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
            tooltip: { backgroundColor: CHART_COLORS.tooltip,
              callbacks: { label: function(ctx) { return ctx.dataset.label + ': ' + ctx.parsed.y; } } }
          },
          scales: {
            x: { stacked: true, grid: { display: false },
              ticks: { autoSkip: true, maxRotation: 60, minRotation: 60, font: { size: 9 } } },
            y: { stacked: true, beginAtZero: true,
              grid: { color: CHART_COLORS.gridLine },
              title: { display: true, text: 'Samples', font: { size: 11 }, color: CHART_COLORS.axisLabel } }
          }
        }
      });
    }

    // CPER Plot 2: Cadence calendar heatmap (custom HTML/CSS grid)
    function renderPgCadence(daily) {
      var container = document.getElementById('pg-cadence');
      if (!container) return;
      container.innerHTML = '';
      if (!daily || daily.length === 0) {
        container.innerHTML = '<p class="text-sm text-stone-500">No dated samples.</p>';
        return;
      }
      // Build month → dom → entry lookup
      var byMonth = {};
      var maxCount = 0;
      daily.forEach(function(d) {
        var ym = d.date.slice(0, 7);
        var dom = parseInt(d.date.slice(8, 10), 10);
        if (!byMonth[ym]) byMonth[ym] = {};
        byMonth[ym][dom] = d;
        if (d.total > maxCount) maxCount = d.total;
      });
      // Build full month list from min..max
      var months = Object.keys(byMonth).sort();
      var first = months[0], last = months[months.length - 1];
      var fullMonths = [];
      var cursor = new Date(first + '-01T00:00:00');
      var end = new Date(last + '-01T00:00:00');
      while (cursor <= end) {
        fullMonths.push(cursor.getFullYear() + '-' + String(cursor.getMonth() + 1).padStart(2, '0'));
        cursor.setMonth(cursor.getMonth() + 1);
      }

      var table = document.createElement('table');
      table.className = 'border-collapse';
      // Header: day-of-month 1..31
      var thead = document.createElement('thead');
      var headRow = document.createElement('tr');
      var blank = document.createElement('th');
      blank.className = 'text-xs text-stone-500 px-2 py-1 text-right';
      blank.textContent = '';
      headRow.appendChild(blank);
      for (var d = 1; d <= 31; d++) {
        var th = document.createElement('th');
        th.className = 'text-[9px] text-stone-400 font-normal w-5 text-center';
        th.textContent = d;
        headRow.appendChild(th);
      }
      thead.appendChild(headRow);
      table.appendChild(thead);

      var tbody = document.createElement('tbody');
      fullMonths.forEach(function(ym) {
        var tr = document.createElement('tr');
        var lbl = document.createElement('td');
        lbl.className = 'text-xs text-stone-600 pr-2 py-0.5 whitespace-nowrap text-right';
        lbl.textContent = ym;
        tr.appendChild(lbl);
        for (var d2 = 1; d2 <= 31; d2++) {
          var td = document.createElement('td');
          td.className = 'w-5 h-5 border border-stone-100';
          var entry = byMonth[ym] && byMonth[ym][d2];
          if (entry) {
            var intensity = Math.min(1, entry.total / maxCount);
            // Pick dominant type for hue, intensity for opacity
            var dom = Object.keys(entry.by_type).reduce(function(a, b) {
              return (entry.by_type[a] || 0) >= (entry.by_type[b] || 0) ? a : b;
            }, 'Air');
            var hex = PG_TYPE_FILL[dom] || SAMPLE_TYPE_COLORS['Unknown'];  // Unknown type fallback (#999999)
            var alpha = (0.18 + intensity * 0.82).toFixed(2);
            td.style.background = hexToRgba(hex, alpha);
            td.title = entry.date + ' — ' + entry.total + ' samples (dominant: ' + dom + ')';
          } else {
            td.style.background = '#fafaf9';
          }
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      container.appendChild(table);

      // Legend
      var legend = document.createElement('div');
      legend.className = 'flex items-center gap-4 mt-3 text-xs text-stone-500 flex-wrap';
      legend.innerHTML =
        '<span>Dominant type:</span>' +
        '<span class="inline-flex items-center gap-1"><span class="inline-block w-3 h-3" style="background:' + PG_TYPE_FILL['Air'] + '"></span>Air</span>' +
        '<span class="inline-flex items-center gap-1"><span class="inline-block w-3 h-3" style="background:' + PG_TYPE_FILL['Plant'] + '"></span>Plant</span>' +
        '<span class="inline-flex items-center gap-1"><span class="inline-block w-3 h-3" style="background:' + PG_TYPE_FILL['Soil'] + '"></span>Soil</span>' +
        '<span class="inline-flex items-center gap-1"><span class="inline-block w-3 h-3" style="background:' + PG_TYPE_FILL['Liquid'] + '"></span>Liquid</span>' +
        '<span class="ml-auto">Hover a cell for date and count. Max day = ' + maxCount + ' samples.</span>';
      container.appendChild(legend);
    }

    function hexToRgba(hex, alpha) {
      var h = hex.replace('#', '');
      var r = parseInt(h.substring(0, 2), 16);
      var g = parseInt(h.substring(2, 4), 16);
      var b = parseInt(h.substring(4, 6), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    // CPER Plot 3: Sampler usage by month (Chart.js stacked bar)
    var PG_SAMPLER_FILL = {
      'SASS':           '#4d7c0f',  // lime-700 — v2 instrument anchor (see DESIGN.md § Sampler Instrument Anchor)
      'Polycarbonate':  '#0f766e',
      'BioSpot VIVAS':  '#22d3ee',
      'Salsola':        '#84cc16',
      'Sagegrass':      '#a3e635',
      'RusThistle':     '#facc15',
      'Tall Grass':     '#65a30d',
      'Hetero':         '#fb923c',
      'Unrecorded':     '#a8a29e'
    };

    function renderPgSamplerMonth(monthly) {
      destroyChart('pgSamplerMonthChart');
      var canvas = document.getElementById('pgSamplerMonthChart');
      if (!canvas || !monthly || monthly.length === 0) return;
      // Stable sampler order: by total across all months
      var totals = {};
      monthly.forEach(function(m) {
        Object.keys(m.by_sampler).forEach(function(s) {
          totals[s] = (totals[s] || 0) + m.by_sampler[s];
        });
      });
      var samplerOrder = Object.keys(totals).sort(function(a, b) { return totals[b] - totals[a]; });
      var labels = monthly.map(function(m) { return m.month; });
      var datasets = samplerOrder.map(function(s) {
        return {
          label: s,
          data: monthly.map(function(m) { return m.by_sampler[s] || 0; }),
          backgroundColor: PG_SAMPLER_FILL[s] || '#78716c',
          borderWidth: 0,
          stack: 'samplers'
        };
      });
      chartInstances['pgSamplerMonthChart'] = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: { labels: labels, datasets: datasets },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } },
            tooltip: { backgroundColor: CHART_COLORS.tooltip,
              callbacks: { label: function(ctx) { return ctx.dataset.label + ': ' + ctx.parsed.y; } } }
          },
          scales: {
            x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
            y: { stacked: true, beginAtZero: true,
              grid: { color: CHART_COLORS.gridLine },
              title: { display: true, text: 'Samples', font: { size: 11 }, color: CHART_COLORS.axisLabel } }
          }
        }
      });
    }

    // CPER Plot 4: AM/PM diurnal strip (custom HTML/CSS)
    function renderPgDiurnal(daily) {
      var container = document.getElementById('pg-diurnal');
      if (!container) return;
      container.innerHTML = '';
      // Filter to days with at least one AM or PM record
      var diurnal = (daily || []).filter(function(d) {
        return (d.ampm.AM || 0) > 0 || (d.ampm.PM || 0) > 0;
      });
      if (diurnal.length === 0) {
        container.innerHTML = '<p class="text-sm text-stone-500">No AM/PM-tagged samples in this group.</p>';
        return;
      }
      // Compute max for intensity scaling
      var maxCell = 0;
      diurnal.forEach(function(d) {
        if (d.ampm.AM > maxCell) maxCell = d.ampm.AM;
        if (d.ampm.PM > maxCell) maxCell = d.ampm.PM;
      });

      var wrap = document.createElement('div');
      wrap.className = 'inline-flex flex-col gap-1';

      // Date axis row (very small)
      var dateRow = document.createElement('div');
      dateRow.className = 'flex gap-px';
      var amLbl = document.createElement('div');
      amLbl.className = 'w-10 text-[10px] text-stone-500 self-end pr-1 text-right';
      dateRow.appendChild(amLbl);
      diurnal.forEach(function(d) {
        var t = document.createElement('div');
        t.className = 'w-4 text-[8px] text-stone-400 text-center -rotate-90 origin-bottom-left whitespace-nowrap';
        // Show only month-day where day is 1 or every ~5 days
        var dom = parseInt(d.date.slice(8, 10), 10);
        if (dom === 1 || dom % 7 === 0) {
          t.textContent = d.date.slice(5);
        }
        dateRow.appendChild(t);
      });

      function makeRow(label, key, hueHex) {
        var row = document.createElement('div');
        row.className = 'flex gap-px items-center';
        var l = document.createElement('div');
        l.className = 'w-10 text-xs font-semibold text-stone-700 pr-1 text-right';
        l.textContent = label;
        row.appendChild(l);
        diurnal.forEach(function(d) {
          var v = d.ampm[key] || 0;
          var cell = document.createElement('div');
          cell.className = 'w-4 h-6 border border-white';
          if (v > 0) {
            var alpha = (0.20 + (v / maxCell) * 0.80).toFixed(2);
            cell.style.background = hexToRgba(hueHex, alpha);
            cell.title = d.date + ' ' + label + ': ' + v;
          } else {
            cell.style.background = '#fafaf9';
          }
          row.appendChild(cell);
        });
        return row;
      }

      var amRow = makeRow('AM', 'AM', '#dc2626'); // red-600
      var pmRow = makeRow('PM', 'PM', '#1d4ed8'); // blue-700

      wrap.appendChild(amRow);
      wrap.appendChild(pmRow);

      var labelRow = document.createElement('div');
      labelRow.className = 'flex gap-px';
      var spacer = document.createElement('div');
      spacer.className = 'w-10';
      labelRow.appendChild(spacer);
      diurnal.forEach(function(d, i) {
        var t = document.createElement('div');
        t.className = 'w-4 text-[8px] text-stone-400 text-center';
        if (i === 0 || i === diurnal.length - 1 || i % Math.max(1, Math.floor(diurnal.length / 8)) === 0) {
          t.textContent = d.date.slice(5);
          t.title = d.date;
        }
        labelRow.appendChild(t);
      });
      wrap.appendChild(labelRow);

      container.appendChild(wrap);

      // Legend / summary
      var totals = diurnal.reduce(function(acc, d) {
        acc.am += (d.ampm.AM || 0);
        acc.pm += (d.ampm.PM || 0);
        return acc;
      }, { am: 0, pm: 0 });
      var legend = document.createElement('div');
      legend.className = 'flex items-center gap-4 mt-3 text-xs text-stone-500';
      legend.innerHTML =
        '<span class="inline-flex items-center gap-1"><span class="inline-block w-3 h-3" style="background:#dc2626"></span>AM (' + totals.am + ')</span>' +
        '<span class="inline-flex items-center gap-1"><span class="inline-block w-3 h-3" style="background:#1d4ed8"></span>PM (' + totals.pm + ')</span>' +
        '<span>Each column = one collection day with AM/PM tags. ' + diurnal.length + ' days, max ' + maxCell + ' samples per slot.</span>';
      container.appendChild(legend);
    }

    function renderPgTimeline(entry) {
      var container = document.getElementById('pg-timeline');
      container.innerHTML = '';
      var first = entry.date_range.first;
      var last  = entry.date_range.last;
      if (!first || !last) {
        container.innerHTML = '<p class="text-sm text-stone-500">No dated samples in this group.</p>';
        return;
      }
      var t0 = new Date(first).getTime();
      var t1 = new Date(last).getTime();
      var span = Math.max(1, t1 - t0);

      entry.sub_projects.forEach(function(sp) {
        var row = document.createElement('div');
        row.className = 'flex items-center gap-3';
        row.setAttribute('role', 'button');
        row.setAttribute('tabindex', '0');
        row.setAttribute('data-subproject-id', sp.project_id);
        row.className += ' cursor-pointer hover:bg-stone-50 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-700';

        var label = document.createElement('div');
        label.className = 'w-56 flex-shrink-0 text-xs text-stone-700 truncate';
        label.textContent = sp.project_id;
        label.title = sp.project_id;

        var trackWrap = document.createElement('div');
        trackWrap.className = 'flex-1 relative bg-stone-100 h-5 rounded overflow-hidden';

        if (sp.date_range.first && sp.date_range.last) {
          var spStart = new Date(sp.date_range.first).getTime();
          var spEnd   = new Date(sp.date_range.last).getTime();
          var leftPct  = ((spStart - t0) / span) * 100;
          var widthPct = Math.max(0.5, ((spEnd - spStart) / span) * 100);
          var bar = document.createElement('div');
          var colorHex = PG_TYPE_COLOR[sp.primary_type] || SAMPLE_TYPE_COLORS['Unknown'];
          bar.className = 'absolute top-0 h-full opacity-90';
          bar.style.background = colorHex;
          bar.style.left = leftPct + '%';
          bar.style.width = widthPct + '%';
          bar.title = sp.project_id + ': ' + sp.date_range.first + ' → ' + sp.date_range.last;
          trackWrap.appendChild(bar);
        }

        var meta = document.createElement('div');
        meta.className = 'w-32 flex-shrink-0 text-xs text-stone-500 text-right';
        meta.textContent = sp.sample_count.toLocaleString() + ' • ' + (sp.primary_type || '—');

        row.appendChild(label);
        row.appendChild(trackWrap);
        row.appendChild(meta);

        row.addEventListener('click', function() { handleGroupItemClick(sp.project_id); });
        row.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleGroupItemClick(sp.project_id); }
        });

        container.appendChild(row);
      });

      // Date axis
      var axis = document.createElement('div');
      axis.className = 'flex justify-between text-[10px] text-stone-400 mt-2 ml-56 mr-32';
      axis.innerHTML = '<span>' + first + '</span><span>' + last + '</span>';
      container.appendChild(axis);
    }

    function renderPgMatrix(cm) {
      var table = document.getElementById('pg-matrix');
      var thead = table.querySelector('thead');
      var tbody = table.querySelector('tbody');
      thead.innerHTML = '';
      tbody.innerHTML = '';
      if (!cm || !cm.media || !cm.samplers) return;

      // Header
      var headRow = document.createElement('tr');
      var blankTh = document.createElement('th');
      blankTh.className = 'px-2 py-2 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide bg-stone-50';
      blankTh.textContent = 'Medium ╲ Sampler';
      headRow.appendChild(blankTh);
      cm.samplers.forEach(function(s) {
        var th = document.createElement('th');
        th.className = 'px-2 py-2 text-center text-xs font-semibold text-stone-600 bg-stone-50 whitespace-nowrap';
        th.textContent = s;
        headRow.appendChild(th);
      });
      var totalTh = document.createElement('th');
      totalTh.className = 'px-2 py-2 text-center text-xs font-bold text-stone-700 bg-stone-100';
      totalTh.textContent = 'Total';
      headRow.appendChild(totalTh);
      thead.appendChild(headRow);

      // Find max for color scaling
      var maxCell = 0;
      cm.media.forEach(function(m) {
        cm.samplers.forEach(function(s) {
          var v = (cm.counts[m] && cm.counts[m][s]) || 0;
          if (v > maxCell) maxCell = v;
        });
      });

      // Rows
      cm.media.forEach(function(m) {
        var tr = document.createElement('tr');
        tr.className = 'border-t border-stone-200';
        var nameTd = document.createElement('td');
        nameTd.className = 'px-2 py-2 text-sm font-medium text-stone-700 whitespace-nowrap';
        nameTd.textContent = m;
        tr.appendChild(nameTd);
        cm.samplers.forEach(function(s) {
          var td = document.createElement('td');
          var v = (cm.counts[m] && cm.counts[m][s]) || 0;
          td.className = 'px-2 py-2 text-center text-sm tabular-nums';
          if (v > 0) {
            var intensity = Math.min(1, v / maxCell);
            // Map intensity 0..1 to a green tint via inline style. Stone-50 → green-700.
            var bgPct = Math.round(intensity * 100);
            td.style.backgroundColor = 'rgba(21, 128, 61, ' + (0.08 + intensity * 0.55).toFixed(2) + ')';
            td.style.color = intensity > 0.55 ? '#fff' : '#1c1917';
            td.style.fontWeight = '600';
            td.textContent = v;
          } else {
            td.className += ' text-stone-300';
            td.textContent = '·';
          }
          tr.appendChild(td);
        });
        var rowTotalTd = document.createElement('td');
        rowTotalTd.className = 'px-2 py-2 text-center text-sm font-bold text-stone-700 bg-stone-50 tabular-nums';
        rowTotalTd.textContent = (cm.row_totals[m] || 0).toLocaleString();
        tr.appendChild(rowTotalTd);
        tbody.appendChild(tr);
      });

      // Column totals row
      var totRow = document.createElement('tr');
      totRow.className = 'border-t border-stone-300 bg-stone-100';
      var totLabel = document.createElement('td');
      totLabel.className = 'px-2 py-2 text-sm font-bold text-stone-700';
      totLabel.textContent = 'Total';
      totRow.appendChild(totLabel);
      cm.samplers.forEach(function(s) {
        var td = document.createElement('td');
        td.className = 'px-2 py-2 text-center text-sm font-bold text-stone-700 tabular-nums';
        td.textContent = (cm.col_totals[s] || 0).toLocaleString();
        totRow.appendChild(td);
      });
      var grandTd = document.createElement('td');
      grandTd.className = 'px-2 py-2 text-center text-sm font-bold text-green-800 bg-stone-200 tabular-nums';
      grandTd.textContent = cm.total.toLocaleString();
      totRow.appendChild(grandTd);
      tbody.appendChild(totRow);
    }

    function renderPgSubprojects(entry) {
      var ul = document.getElementById('pg-subprojects');
      ul.innerHTML = '';
      // Sort by sample_count desc for the drilldown list
      entry.sub_projects.slice().sort(function(a, b) { return b.sample_count - a.sample_count; }).forEach(function(sp) {
        var li = document.createElement('li');
        li.setAttribute('role', 'button');
        li.setAttribute('tabindex', '0');
        li.className = 'flex items-center justify-between gap-3 py-3 cursor-pointer hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-green-700 rounded px-2';
        var left = document.createElement('div');
        left.className = 'min-w-0 flex-1';
        left.innerHTML = '<p class="text-sm font-medium text-stone-800 truncate">' + sp.project_id + '</p>' +
          '<p class="text-xs text-stone-500 mt-0.5">' + (sp.date_range.first || '?') + ' → ' + (sp.date_range.last || '?') + ' • primary: ' + (sp.primary_type || '—') + '</p>';
        var right = document.createElement('div');
        right.className = 'flex items-center gap-3 flex-shrink-0';
        var typesStr = sp.sample_types.map(function(t) { return t.type + ' ' + t.count; }).join(' · ');
        var typesEl = document.createElement('span');
        typesEl.className = 'hidden sm:inline text-xs text-stone-500';
        typesEl.textContent = typesStr;
        var countEl = document.createElement('span');
        countEl.className = 'text-sm font-semibold text-stone-700 tabular-nums';
        countEl.textContent = sp.sample_count.toLocaleString();
        var arrow = document.createElement('span');
        arrow.className = 'text-stone-400';
        arrow.textContent = '→';
        right.appendChild(typesEl);
        right.appendChild(countEl);
        right.appendChild(arrow);
        li.appendChild(left);
        li.appendChild(right);
        li.addEventListener('click', function() { handleGroupItemClick(sp.project_id); });
        li.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleGroupItemClick(sp.project_id); }
        });
        ul.appendChild(li);
      });
    }

    // =============================================================================
    // SLICE PANEL — PROJECT VIEW RENDERER
    // =============================================================================

    function renderProjectView(groupId) {
      var grid = document.getElementById('slice-project-grid');

      if (!appData.slice_views || !appData.slice_views.project) {
        showSliceNoData(grid, 'No data available for the selected project.');
        return;
      }

      var entry = appData.slice_views.project.find(function(e) {
        return e.project_id === groupId;
      });

      if (!entry) {
        showSliceNoData(grid, 'No data available for the selected project.');
        return;
      }

      hideSliceNoData(grid);

      // Phase 2: descriptor-driven path. Falls through to the legacy renderer below when the
      // flag is off or layouts are missing (getLayoutFor returns null).
      var descriptor = getLayoutFor('project', entry);
      if (USE_RENDER_SLICE && descriptor) {
        if (DESIGN_MODE) { setActiveDesignSlice('project', entry, grid); }
        renderSlice(descriptor, entry, grid);
        return;
      }

      // Chart 1: Sample Types (Doughnut)
      destroyChart('sliceProjectTypesChart');
      var ctx1 = document.getElementById('sliceProjectTypesChart').getContext('2d');
      chartInstances['sliceProjectTypesChart'] = new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: entry.sample_types.map(function(d) { return d.type; }),
          datasets: [{
            data: entry.sample_types.map(function(d) { return d.count; }),
            backgroundColor: entry.sample_types.map(function(d) { return SAMPLE_TYPE_COLORS[d.type] || SAMPLE_TYPE_COLORS['Unknown']; }),
            borderColor: CHART_COLORS.donutBorder,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'right',
              labels: { usePointStyle: true, boxWidth: 10, font: { size: 12 } }
            },
            tooltip: {
              enabled: true,
              backgroundColor: CHART_COLORS.tooltip,
              callbacks: {
                label: function(ctx) { var ct = entry.type_pipeline_crossTab && entry.type_pipeline_crossTab[ctx.label]; return ct ? ['Collected: '+(ct.collected||0).toLocaleString(),'Extracted: '+(ct.dna_extracted||0).toLocaleString(),'Sequenced: '+(ct.sequenced||0).toLocaleString()] : tooltipLabelPct(ctx); }
              }
            }
          }
        }
      });

      // Chart 2: Pipeline Progression (Horizontal Bar)
      destroyChart('sliceProjectPipelineChart');
      var ctx2 = document.getElementById('sliceProjectPipelineChart').getContext('2d');
      chartInstances['sliceProjectPipelineChart'] = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: ['Collected', 'DNA Extracted', 'Sequenced'],
          datasets: [{
            data: [entry.pipeline.collected, entry.pipeline.dna_extracted, entry.pipeline.sequenced],
            backgroundColor: CHART_COLORS.slicePipeline,
            borderWidth: 0,
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              backgroundColor: CHART_COLORS.tooltip,
              callbacks: {
                label: function(ctx) { var pKey={'Collected':'collected','DNA Extracted':'dna_extracted','Sequenced':'sequenced'}[ctx.label]; var tl=entry.pipeline_type_crossTab&&pKey&&entry.pipeline_type_crossTab[pKey]; return tl?tl.map(function(t){return t.type+': '+t.count.toLocaleString();}):tooltipLabelSamples(ctx); }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: CHART_COLORS.gridLine },
              ticks: {
                callback: function(val) {
                  return val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val;
                }
              }
            },
            y: { grid: { display: false } }
          }
        }
      });

      // Chart 3: Temporal Activity (Line)
      destroyChart('sliceProjectTemporalChart');
      var ctx3 = document.getElementById('sliceProjectTemporalChart').getContext('2d');
      var projectGapped = insertGapMarkers(entry.temporal);
      chartInstances['sliceProjectTemporalChart'] = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: projectGapped.labels,
          datasets: [{
            label: 'Samples Collected',
            data: projectGapped.counts,
            backgroundColor: CHART_COLORS.sliceTemporalBar,
            borderWidth: 0
          }]
        },
        options: (function() { var o = buildTemporalChartOptions(); o.plugins = o.plugins || {}; o.plugins.tooltip = o.plugins.tooltip || {}; o.plugins.tooltip.callbacks = { title: function(items) { return items.length ? items[0].label : ''; }, label: function(ctx) { if (ctx.parsed.y === null || ctx.parsed.y === undefined) { return ''; } var te = (entry.temporal||[]).find(function(t){return t.month===ctx.label;}); return te && te.types && te.types.length ? te.types.map(function(t){return t.type+': '+t.count.toLocaleString();}) : (te ? te.count.toLocaleString()+' samples' : ctx.parsed.y.toLocaleString()+' samples'); } }; return o; }())
      });

      renderTagGroups('sliceProjectReplicateBadges', entry.tag_groups);
      renderSamplerTypeChart('sliceProjectSamplerChart', entry.sampler_type_dist);
      var _sc = chartInstances['sliceProjectSamplerChart'];
      if (_sc) { var _gl = entry.project_id; _sc.options.plugins.tooltip.callbacks.label = function(ctx) { return ctx.parsed.y.toLocaleString() + ' samples' + (_gl ? ' in ' + _gl : ''); }; _sc.update('none'); }
    }

    // =============================================================================
    // SLICE PANEL — LOCATION VIEW RENDERER
    // =============================================================================

    function renderLocationView(groupId) {
      var grid = document.getElementById('slice-location-grid');
      var timeDistCard = document.getElementById('slice-location-timeofday-card');

      if (!appData.slice_views || !appData.slice_views.location) {
        showSliceNoData(grid, 'No data available for the selected location.');
        timeDistCard.classList.add('hidden');
        return;
      }

      var entry = appData.slice_views.location.find(function(e) {
        return e.site_code === groupId;
      });

      if (!entry) {
        showSliceNoData(grid, 'No data available for the selected location.');
        timeDistCard.classList.add('hidden');
        return;
      }

      hideSliceNoData(grid);

      // Phase 2b: descriptor-driven path (legacy body below — incl. the static time-of-day card
      // show/hide — is the flag-off / missing-layout fallback only).
      var descriptor = getLayoutFor('location', entry);
      if (USE_RENDER_SLICE && descriptor) {
        if (DESIGN_MODE) { setActiveDesignSlice('location', entry, grid); }
        renderSlice(descriptor, entry, grid);
        return;
      }

      // Chart 1: Sub-Location Sample Counts (Horizontal Bar)
      destroyChart('sliceLocationSubsitesChart');
      var ctx1 = document.getElementById('sliceLocationSubsitesChart').getContext('2d');
      chartInstances['sliceLocationSubsitesChart'] = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: entry.sub_sites.map(function(d) { return d.sub_name; }),
          datasets: [{
            data: entry.sub_sites.map(function(d) { return d.count; }),
            backgroundColor: CHART_COLORS.sliceLocationBar,
            borderWidth: 0,
            borderRadius: 3
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: CHART_COLORS.tooltip,
              callbacks: {
                label: tooltipLabelSamples
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: CHART_COLORS.gridLine },
              ticks: {
                callback: function(val) {
                  return val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val;
                }
              }
            },
            y: { grid: { display: false }, ticks: { font: { size: 10 } } }
          }
        }
      });

      // Chart 2: Sample Types at Location (Doughnut)
      destroyChart('sliceLocationTypesChart');
      var ctx2 = document.getElementById('sliceLocationTypesChart').getContext('2d');
      chartInstances['sliceLocationTypesChart'] = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: entry.sample_types.map(function(d) { return d.type; }),
          datasets: [{
            data: entry.sample_types.map(function(d) { return d.count; }),
            backgroundColor: entry.sample_types.map(function(d) { return SAMPLE_TYPE_COLORS[d.type] || SAMPLE_TYPE_COLORS['Unknown']; }),
            borderColor: CHART_COLORS.donutBorder,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'right',
              labels: { usePointStyle: true, boxWidth: 10, font: { size: 12 } }
            },
            tooltip: {
              enabled: true,
              backgroundColor: CHART_COLORS.tooltip,
              callbacks: {
                label: function(ctx) { var ct = entry.type_pipeline_crossTab && entry.type_pipeline_crossTab[ctx.label]; return ct ? ['Collected: '+(ct.collected||0).toLocaleString(),'Extracted: '+(ct.dna_extracted||0).toLocaleString(),'Sequenced: '+(ct.sequenced||0).toLocaleString()] : tooltipLabelPct(ctx); }
              }
            }
          }
        }
      });

      // Chart 3: Temporal Activity (Line)
      destroyChart('sliceLocationTemporalChart');
      var ctx3 = document.getElementById('sliceLocationTemporalChart').getContext('2d');
      var locationGapped = insertGapMarkers(entry.temporal);
      chartInstances['sliceLocationTemporalChart'] = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: locationGapped.labels,
          datasets: [{
            label: 'Samples Collected',
            data: locationGapped.counts,
            backgroundColor: CHART_COLORS.sliceTemporalBar,
            borderWidth: 0
          }]
        },
        options: (function() { var o = buildTemporalChartOptions(); o.plugins = o.plugins || {}; o.plugins.tooltip = o.plugins.tooltip || {}; o.plugins.tooltip.callbacks = { title: function(items) { return items.length ? items[0].label : ''; }, label: function(ctx) { if (ctx.parsed.y === null || ctx.parsed.y === undefined) { return ''; } var te = (entry.temporal||[]).find(function(t){return t.month===ctx.label;}); return te && te.types && te.types.length ? te.types.map(function(t){return t.type+': '+t.count.toLocaleString();}) : (te ? te.count.toLocaleString()+' samples' : ctx.parsed.y.toLocaleString()+' samples'); } }; return o; }())
      });

      // Chart 4 (Optional): Time of Day Distribution (Polar Area)
      destroyChart('sliceLocationTimeDistChart');
      if (entry.time_distribution && entry.time_distribution.length > 0) {
        timeDistCard.classList.remove('hidden');
        var ctx4 = document.getElementById('sliceLocationTimeDistChart').getContext('2d');
        chartInstances['sliceLocationTimeDistChart'] = new Chart(ctx4, {
          type: 'bar',
          data: {
            labels: entry.time_distribution.map(function(d) { return d.time_period; }),
            datasets: [{
              data: entry.time_distribution.map(function(d) { return d.count; }),
              /* TIME-OF-DAY BAR COLORS — edit CHART_COLORS.sliceTimeOfDay to change bar fill colors */
              backgroundColor: CHART_COLORS.sliceTimeOfDay,
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: CHART_COLORS.tooltip,
                callbacks: {
                  label: function(ctx) {
                    return ' ' + ctx.label + ': ' + ctx.parsed.y.toLocaleString() + ' samples';
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { size: 11 } },
                title: { display: true, text: 'Time Period', color: CHART_COLORS.axisLabel, font: { size: 11 } }
              },
              y: {
                beginAtZero: true,
                grid: { color: CHART_COLORS.gridLine },
                title: { display: true, text: 'Samples', color: CHART_COLORS.axisLabel, font: { size: 11 } }
              }
            }
          }
        });
      } else {
        timeDistCard.classList.add('hidden');
      }

      renderTagGroups('sliceLocationReplicateBadges', entry.tag_groups);
      renderSamplerTypeChart('sliceLocationSamplerChart', entry.sampler_type_dist);
      var _sc = chartInstances['sliceLocationSamplerChart'];
      if (_sc) { var _gl = entry.site_name; _sc.options.plugins.tooltip.callbacks.label = function(ctx) { return ctx.parsed.y.toLocaleString() + ' samples' + (_gl ? ' in ' + _gl : ''); }; _sc.update('none'); }
    }

    // =============================================================================
    // SLICE PANEL — LAB GROUP VIEW RENDERER
    // =============================================================================

    function renderLabGroupView(groupId) {
      var grid = document.getElementById('slice-labgroup-grid');

      // Guard: lab_group empty array — no charts, no errors
      if (!appData.slice_views || !appData.slice_views.lab_group ||
          appData.slice_views.lab_group.length === 0) {
        showSliceNoData(grid, 'Lab Group data is not available.');
        return;
      }

      var entry = appData.slice_views.lab_group.find(function(e) {
        return e.group_name === groupId;
      });

      if (!entry) {
        showSliceNoData(grid, 'No data available for the selected lab group.');
        return;
      }

      hideSliceNoData(grid);

      // Phase 2b: descriptor-driven path (legacy body below is the flag-off / missing-layout fallback).
      var descriptor = getLayoutFor('lab_group', entry);
      if (USE_RENDER_SLICE && descriptor) {
        if (DESIGN_MODE) { setActiveDesignSlice('lab_group', entry, grid); }
        renderSlice(descriptor, entry, grid);
        return;
      }

      // Chart 1: Sample Types (Doughnut)
      destroyChart('sliceLabGroupTypesChart');
      var ctx1 = document.getElementById('sliceLabGroupTypesChart').getContext('2d');
      chartInstances['sliceLabGroupTypesChart'] = new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: entry.sample_types.map(function(d) { return d.type; }),
          datasets: [{
            data: entry.sample_types.map(function(d) { return d.count; }),
            backgroundColor: entry.sample_types.map(function(d) { return SAMPLE_TYPE_COLORS[d.type] || SAMPLE_TYPE_COLORS['Unknown']; }),
            borderColor: CHART_COLORS.donutBorder,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'right',
              labels: { usePointStyle: true, boxWidth: 10, font: { size: 12 } }
            },
            tooltip: {
              enabled: true,
              backgroundColor: CHART_COLORS.tooltip,
              callbacks: {
                label: function(ctx) { var ct = entry.type_pipeline_crossTab && entry.type_pipeline_crossTab[ctx.label]; return ct ? ['Collected: '+(ct.collected||0).toLocaleString(),'Extracted: '+(ct.dna_extracted||0).toLocaleString(),'Sequenced: '+(ct.sequenced||0).toLocaleString()] : tooltipLabelPct(ctx); }
              }
            }
          }
        }
      });

      // Chart 2: Pipeline Progression (Horizontal Bar)
      destroyChart('sliceLabGroupPipelineChart');
      var ctx2 = document.getElementById('sliceLabGroupPipelineChart').getContext('2d');
      chartInstances['sliceLabGroupPipelineChart'] = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: ['Collected', 'DNA Extracted', 'Sequenced'],
          datasets: [{
            data: [entry.pipeline.collected, entry.pipeline.dna_extracted, entry.pipeline.sequenced],
            backgroundColor: CHART_COLORS.slicePipeline,
            borderWidth: 0,
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              backgroundColor: CHART_COLORS.tooltip,
              callbacks: {
                label: function(ctx) { var pKey={'Collected':'collected','DNA Extracted':'dna_extracted','Sequenced':'sequenced'}[ctx.label]; var tl=entry.pipeline_type_crossTab&&pKey&&entry.pipeline_type_crossTab[pKey]; return tl?tl.map(function(t){return t.type+': '+t.count.toLocaleString();}):tooltipLabelSamples(ctx); }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: CHART_COLORS.gridLine },
              ticks: {
                callback: function(val) {
                  return val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val;
                }
              }
            },
            y: { grid: { display: false } }
          }
        }
      });

      // Chart 3: Temporal Activity (Line)
      destroyChart('sliceLabGroupTemporalChart');
      var ctx3 = document.getElementById('sliceLabGroupTemporalChart').getContext('2d');
      var labGroupGapped = insertGapMarkers(entry.temporal);
      chartInstances['sliceLabGroupTemporalChart'] = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: labGroupGapped.labels,
          datasets: [{
            label: 'Samples Collected',
            data: labGroupGapped.counts,
            backgroundColor: CHART_COLORS.sliceTemporalBar,
            borderWidth: 0
          }]
        },
        options: (function() { var o = buildTemporalChartOptions(); o.plugins = o.plugins || {}; o.plugins.tooltip = o.plugins.tooltip || {}; o.plugins.tooltip.callbacks = { title: function(items) { return items.length ? items[0].label : ''; }, label: function(ctx) { if (ctx.parsed.y === null || ctx.parsed.y === undefined) { return ''; } var te = (entry.temporal||[]).find(function(t){return t.month===ctx.label;}); return te && te.types && te.types.length ? te.types.map(function(t){return t.type+': '+t.count.toLocaleString();}) : (te ? te.count.toLocaleString()+' samples' : ctx.parsed.y.toLocaleString()+' samples'); } }; return o; }())
      });

      renderTagGroups('sliceLabGroupReplicateBadges', entry.tag_groups);
      renderSamplerTypeChart('sliceLabGroupSamplerChart', entry.sampler_type_dist);
      var _sc = chartInstances['sliceLabGroupSamplerChart'];
      if (_sc) { var _gl = entry.group_name; _sc.options.plugins.tooltip.callbacks.label = function(ctx) { return ctx.parsed.y.toLocaleString() + ' samples' + (_gl ? ' in ' + _gl : ''); }; _sc.update('none'); }
    }

    // =============================================================================
    // SLICE PANEL — RENDER VIEW
    // =============================================================================

    /**
     * renderView — central dispatch for slice panel state.
     * Called after any filterState mutation.
     * NEVER calls initDashboard().
     */
    function renderView() {
      var cat   = filterState.slice.category;
      var group = filterState.slice.group;

      var sliceContainer  = document.getElementById('slice-view-container');
      var projectView     = document.getElementById('slice-project-view');
      var projectGroupView = document.getElementById('slice-projectgroup-view');
      var locationView    = document.getElementById('slice-location-view');
      var labgroupView    = document.getElementById('slice-labgroup-view');
      var activeLabel     = document.getElementById('slice-active-label');
      var clearBtn        = document.getElementById('slice-clear-btn');
      var viewTitle       = document.getElementById('slice-view-title');
      var viewSubtitle    = document.getElementById('slice-view-subtitle');

      // --- Update category button visual states ---
      updateCategoryButtonStates();

      // --- Global charts area filter (no envelope — chip in header handles indication) ---
      var globalChartsArea = document.getElementById('global-charts-area');
      if (globalChartsArea) {
        if (isFilterActive()) { applyFilter(filterState); }
      }

      // --- Branch on state ---

      // Destroy all existing slice chart instances before any new rendering
      destroyAllSliceCharts();

      if (cat === null) {
        // Default view: hide slice container, show global charts area
        sliceContainer.classList.add('hidden');
        sliceContainer.classList.remove('block', 'bg-orange-50', 'transition-colors', 'duration-300');

        projectView.classList.add('hidden');
        if (projectGroupView) projectGroupView.classList.add('hidden');
        locationView.classList.add('hidden');
        labgroupView.classList.add('hidden');

        activeLabel.classList.add('hidden');
        activeLabel.classList.remove('block');
        clearBtn.classList.add('hidden');
        clearBtn.classList.remove('block');

        // Collapse all group lists
        ['project-group-list', 'location-group-list', 'labgroup-group-list'].forEach(function(id) {
          document.getElementById(id).classList.add('hidden');
        });

        // Show global charts area when no slice category is selected
        if (globalChartsArea) {
          globalChartsArea.classList.remove('hidden');
        }

        // Hide active filter chip
        var chipDefault = document.getElementById('slice-active-chip');
        if (chipDefault) { chipDefault.classList.add('hidden'); }

        refreshTableIfReady(); return;
      }

      // cat !== null: hide global charts area in BOTH cat!==null branches
      if (globalChartsArea) {
        globalChartsArea.classList.add('hidden');
      }

      if (cat !== null && group === null) {
        // Category selected, no group yet: show group list, hide slice container
        sliceContainer.classList.add('hidden');
        sliceContainer.classList.remove('block', 'bg-orange-50', 'transition-colors', 'duration-300');

        activeLabel.classList.add('hidden');
        clearBtn.classList.add('hidden');

        // Show the correct group list, hide others
        var listMap = {};
        listMap[SLICE_CATEGORIES.PROJECT]   = 'project-group-list';
        listMap[SLICE_CATEGORIES.LOCATION]  = 'location-group-list';
        listMap[SLICE_CATEGORIES.LAB_GROUP] = 'labgroup-group-list';

        Object.keys(listMap).forEach(function(key) {
          var listEl = document.getElementById(listMap[key]);
          if (key === cat) {
            listEl.classList.remove('hidden');
          } else {
            listEl.classList.add('hidden');
          }
        });

        refreshTableIfReady(); return;
      }

      // Both category and group are set: show slice view container
      sliceContainer.classList.remove('hidden');
      sliceContainer.classList.add('block', 'bg-orange-50', 'transition-colors', 'duration-300');

      // Show correct inner view, hide others
      projectView.classList.add('hidden');
      if (projectGroupView) projectGroupView.classList.add('hidden');
      locationView.classList.add('hidden');
      labgroupView.classList.add('hidden');

      var activeChip = document.getElementById('slice-active-chip');

      // Project group takes precedence over plain project when group_id matches a project_group entry
      var pgEntry = (cat === SLICE_CATEGORIES.PROJECT && appData.slice_views && appData.slice_views.project_group)
        ? appData.slice_views.project_group.find(function(e) { return e.group_id === group; })
        : null;

      if (pgEntry) {
        if (projectGroupView) projectGroupView.classList.remove('hidden');
        viewTitle.textContent = 'Project Group: ' + group;
        viewSubtitle.textContent = pgEntry.sample_count.toLocaleString() + ' samples across ' + pgEntry.sub_projects.length + ' sub-projects';
        if (activeChip && group) { activeChip.textContent = 'Filtered: ' + group + ' (group)'; activeChip.classList.remove('hidden'); }
        renderProjectGroupView(group);
      } else if (cat === SLICE_CATEGORIES.PROJECT) {
        projectView.classList.remove('hidden');
        viewTitle.textContent = SLICE_CATEGORIES.PROJECT + ': ' + group;
        var projEntry = appData.slice_views && appData.slice_views.project
          ? appData.slice_views.project.find(function(e) { return e.project_id === group; })
          : null;
        viewSubtitle.textContent = projEntry ? projEntry.sample_count.toLocaleString() + ' samples' : '';
        if (activeChip && group) { activeChip.textContent = 'Filtered: ' + group; activeChip.classList.remove('hidden'); }
        renderProjectView(group);
      } else if (cat === SLICE_CATEGORIES.LOCATION) {
        locationView.classList.remove('hidden');
        viewTitle.textContent = SLICE_CATEGORIES.LOCATION + ': ' + group;
        var locEntry = appData.slice_views && appData.slice_views.location
          ? appData.slice_views.location.find(function(e) { return e.site_code === group; })
          : null;
        viewSubtitle.textContent = locEntry ? locEntry.sample_count.toLocaleString() + ' samples' : '';
        if (activeChip && group) { activeChip.textContent = 'Filtered: ' + group; activeChip.classList.remove('hidden'); }
        renderLocationView(group);
      } else if (cat === SLICE_CATEGORIES.LAB_GROUP) {
        labgroupView.classList.remove('hidden');
        viewTitle.textContent = SLICE_CATEGORIES.LAB_GROUP + ': ' + group;
        var lgEntry = appData.slice_views && appData.slice_views.lab_group
          ? appData.slice_views.lab_group.find(function(e) { return e.group_name === group; })
          : null;
        viewSubtitle.textContent = lgEntry ? lgEntry.sample_count.toLocaleString() + ' samples' : '';
        if (activeChip && group) { activeChip.textContent = 'Filtered: ' + group; activeChip.classList.remove('hidden'); }
        renderLabGroupView(group);
      }

      // Show active label and clear button
      activeLabel.textContent = 'Showing: ' + group;
      activeLabel.classList.remove('hidden');
      activeLabel.classList.add('block');
      clearBtn.classList.remove('hidden');
      clearBtn.classList.add('block');

      // Update aria-selected on group items
      updateGroupItemSelection();

      // Update tag filter banner and project-context banner for the visible slice container
      updateTagBanner();
      updateProjectBanner();

      // Scroll slice container into view
      sliceContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      sliceContainer.focus({ preventScroll: true });

      refreshTableIfReady();
    }

    // =============================================================================
    // SLICE PANEL — BUTTON STATE HELPERS
    // =============================================================================

    function updateCategoryButtonStates() {
      // --- slice-btn-all: active when category === null (full orange fill, no accent bar) ---
      var btnAll = document.getElementById('slice-btn-all');
      if (btnAll) {
        if (filterState.slice.category === null) {
          // De-oranged: "All BROADN Samples" active state uses teal neutral, NOT orange (orange = filter signal only)
          btnAll.className = 'w-full text-left px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-inset transition-colors';
          btnAll.style.cssText = 'background:#f0fdfd;color:#0c5454;outline-color:#0c9cb4;';
          btnAll.setAttribute('aria-pressed', 'true');
        } else {
          btnAll.className = 'w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset transition-colors';
          btnAll.style.cssText = '';
          btnAll.setAttribute('aria-pressed', 'false');
        }
      }

      // --- The 3 category buttons: active with green style + left accent bar ---
      var buttonMap = {};
      buttonMap[SLICE_CATEGORIES.PROJECT]   = 'slice-btn-project';
      buttonMap[SLICE_CATEGORIES.LOCATION]  = 'slice-btn-location';
      buttonMap[SLICE_CATEGORIES.LAB_GROUP] = 'slice-btn-labgroup';

      Object.keys(buttonMap).forEach(function(cat) {
        var btn = document.getElementById(buttonMap[cat]);
        var isActive = filterState.slice.category === cat;

        if (isActive) {
          btn.className = 'relative w-full text-left px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset transition-colors';
          btn.style.cssText = 'background:#f0fdfd;color:#0c5454;';
          btn.setAttribute('aria-expanded', 'true');

          // Add accent bar if not already present
          if (!btn.querySelector('.slice-accent-bar')) {
            var accent = document.createElement('span');
            accent.className = 'slice-accent-bar absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full';
            accent.style.background = '#0c9cb4';  // bright teal accent — non-text use (WCAG: border/accent OK)
            accent.setAttribute('aria-hidden', 'true');
            btn.insertBefore(accent, btn.firstChild);
          }
        } else {
          // Remove accent bar if present
          var existing = btn.querySelector('.slice-accent-bar');
          if (existing) { btn.removeChild(existing); }

          btn.className = 'w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset transition-colors';
          btn.style.cssText = '';
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    function updateGroupItemSelection() {
      var allItems = document.querySelectorAll('#project-group-list [role="option"], #location-group-list [role="option"], #labgroup-group-list [role="option"]');
      allItems.forEach(function(li) {
        var isSelected = li.getAttribute('data-group-id') === filterState.slice.group;
        li.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        if (isSelected) {
          li.className = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold text-orange-700 bg-orange-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-inset';
        } else {
          li.className = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-stone-600 cursor-pointer hover:bg-stone-100 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-inset';
        }
      });
    }

    // =============================================================================
    // SLICE SIDEBAR — MOBILE DRAWER
    // =============================================================================

    function openMobileDrawer() {
      var sidebar  = document.getElementById('slice-sidebar');
      var overlay  = document.getElementById('slice-sidebar-overlay');
      var trigger  = document.getElementById('slice-drawer-trigger');

      // Switch sidebar to fixed mobile drawer mode
      sidebar.classList.remove('hidden', 'lg:flex', 'lg:flex-col', 'w-64', 'flex-shrink-0',
        'sticky', 'top-16', 'self-start', 'max-h-[calc(100vh-4rem)]', 'border-r', 'border-stone-200');
      sidebar.classList.add('fixed', 'left-0', 'top-0', 'h-full', 'w-72', 'z-40', 'bg-white',
        'shadow-xl', 'overflow-y-auto', 'flex', 'flex-col', 'translate-x-0', 'transition-transform',
        'duration-300', 'ease-in-out');

      overlay.className = 'fixed inset-0 bg-black/40 z-30';

      trigger.setAttribute('aria-expanded', 'true');
    }

    function closeMobileDrawer() {
      var sidebar  = document.getElementById('slice-sidebar');
      var overlay  = document.getElementById('slice-sidebar-overlay');
      var trigger  = document.getElementById('slice-drawer-trigger');

      // Restore sidebar to desktop sticky mode (hidden on mobile)
      sidebar.className = 'hidden lg:flex lg:flex-col w-64 flex-shrink-0 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto border-r border-stone-200';

      overlay.className = 'hidden';

      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }

    // =============================================================================
    // SLICE SIDEBAR — KEYBOARD NAVIGATION
    // =============================================================================

    function getCategoryButtons() {
      return [
        document.getElementById('slice-btn-all'),       // index 0: All BROADN Samples
        document.getElementById('slice-btn-project'),   // index 1
        document.getElementById('slice-btn-location'),  // index 2
        document.getElementById('slice-btn-labgroup')   // index 3
      ];
    }

    function handleCategoryButtonKeydown(event, btnIndex) {
      var buttons = getCategoryButtons();

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        var nextIndex = (btnIndex + 1) % buttons.length;
        buttons[nextIndex].focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        var prevIndex = (btnIndex - 1 + buttons.length) % buttons.length;
        buttons[prevIndex].focus();
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        buttons[btnIndex].click();
        // After click, if group list is now visible, focus first item.
        // listIds[0] is null (slice-btn-all has no group list) — null guard prevents getElementById(null).
        var listIds = [null, 'project-group-list', 'location-group-list', 'labgroup-group-list'];
        var list = listIds[btnIndex] ? document.getElementById(listIds[btnIndex]) : null;
        if (list && !list.classList.contains('hidden')) {
          var firstItem = list.querySelector('[role="option"]');
          if (firstItem) { firstItem.focus(); }
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        // Global: clear filter, collapse all, focus first button (slice-btn-all)
        clearSliceFilter();
        buttons[0].focus();
      }
    }

    function handleGroupItemKeydown(event, li, listEl, ownerBtnId) {
      var items = Array.from(listEl.querySelectorAll('[role="option"]'));
      var idx   = items.indexOf(li);

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (idx < items.length - 1) {
          items[idx + 1].focus();
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (idx > 0) {
          items[idx - 1].focus();
        } else {
          // First item: move focus back to category button
          document.getElementById(ownerBtnId).focus();
        }
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        li.click();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        // Collapse group list, return focus to category button, also clear if group selected
        clearSliceFilter();
        document.getElementById(ownerBtnId).focus();
      }
    }

    // =============================================================================
    // SLICE SIDEBAR — CLEAR FILTER
    // =============================================================================

    function clearSliceFilter() {
      filterState.slice.category = null;
      filterState.slice.group    = null;
      filterState.tags = [];
      renderView();
      renderTagGroups('globalReplicateBadges', globalTagsDict);
    }

    // =============================================================================
    // SLICE SIDEBAR — CATEGORY BUTTON CLICK HANDLERS
    // =============================================================================

    function handleCategoryClick(category) {
      if (!appData || !appData.slice_views) {
        // slice_views key absent — show degradation message
        return;
      }

      if (filterState.slice.category === category) {
        // Toggle off: collapse category
        filterState.slice.category = null;
        filterState.slice.group    = null;
        renderView();
        return;
      }

      filterState.slice.category = category;
      filterState.slice.group    = null;

      // Spec section 6.1: if lab_group array is empty, clicking Lab Group goes
      // directly to the slice-view-container showing the empty-state message
      // (no group list to display). Use a sentinel group value so renderView()
      // enters the "both set" branch; renderLabGroupView() handles the empty guard.
      if (category === SLICE_CATEGORIES.LAB_GROUP &&
          Array.isArray(appData.slice_views.lab_group) &&
          appData.slice_views.lab_group.length === 0) {
        filterState.slice.group = '__empty__';
      }

      renderView();
    }

    // =============================================================================
    // SLICE SIDEBAR — GROUP ITEM CLICK HANDLER
    // =============================================================================

    function handleGroupItemClick(groupId) {
      filterState.slice.group = groupId;
      renderView();
    }

    // =============================================================================
    // SLICE SIDEBAR — POPULATE GROUP LISTS FROM DATA
    // =============================================================================

    function populateSidebarGroupLists(data) {
      var projectList  = document.getElementById('project-group-list');
      var locationList = document.getElementById('location-group-list');
      var labgroupList = document.getElementById('labgroup-group-list');

      if (!data.slice_views) {
        // Graceful degradation: show inline message on each category button click
        // The button click handler already guards against missing slice_views.
        // Insert a static message node into each list so it's ready if needed.
        var msg = 'Data not loaded yet \u2014 please re-run preprocess_data.py';

        [projectList, locationList, labgroupList].forEach(function(listEl) {
          var li = document.createElement('li');
          li.className = 'px-3 py-2 text-xs text-stone-500 italic';
          li.textContent = msg;
          listEl.appendChild(li);
        });
        return;
      }

      // Project list — populate flat projects, then prepend pinned project_group items
      if (data.slice_views.project && data.slice_views.project.length > 0) {
        populateGroupList(projectList, data.slice_views.project, 'project_id', 'project_id', 'sample_count');
      }
      prependProjectGroupItems(projectList, data.slice_views.project_group);

      // Location list
      if (data.slice_views.location && data.slice_views.location.length > 0) {
        populateGroupList(locationList, data.slice_views.location, 'site_name', 'site_code', 'sample_count');
      }

      // Lab Group list — may be empty per spec section 6.1
      if (data.slice_views.lab_group && data.slice_views.lab_group.length > 0) {
        populateGroupList(labgroupList, data.slice_views.lab_group, 'group_name', 'group_name', 'sample_count');
      }
      // If lab_group is empty array, clicking Lab Group button shows empty-state message
      // in slice-view-container — handled in renderView() via 004b; this task just leaves
      // the list empty (no items rendered).
    }

    // =============================================================================
    // MAIN INIT — fetch data and render everything
    // =============================================================================
    function showError() {
      document.getElementById('loading-state').classList.add('hidden');
      document.getElementById('error-state').classList.remove('hidden');
    }

    function showContent() {
      document.getElementById('loading-state').classList.add('hidden');
      document.getElementById('main-content').classList.remove('hidden');
      document.getElementById('main-content').classList.add('flex');
    }

    function initDashboard(data) {
      // Validate expected top-level shape before using.
      // Checks 8 required keys (meta is optional, slice_views is new and optional).
      if (
        typeof data !== 'object' || data === null ||
        typeof data.kpis !== 'object' ||
        !Array.isArray(data.temporal) ||
        !Array.isArray(data.sample_types) ||
        typeof data.pipeline !== 'object' ||
        !Array.isArray(data.sites) ||
        !Array.isArray(data.by_site) ||
        !Array.isArray(data.recent_samples)
      ) {
        showError();
        return;
      }

      appData = data;

      // -- Wire event listeners ONCE (not in renderView) --

      // Clear filter button
      document.getElementById('slice-clear-btn').addEventListener('click', function() {
        clearSliceFilter();
      });

      // Mobile drawer trigger
      document.getElementById('slice-drawer-trigger').addEventListener('click', function() {
        openMobileDrawer();
      });

      // Mobile close button
      document.getElementById('slice-sidebar-close').addEventListener('click', function() {
        closeMobileDrawer();
      });

      // Overlay click to close drawer
      document.getElementById('slice-sidebar-overlay').addEventListener('click', function() {
        closeMobileDrawer();
      });

      // Category button: All BROADN Samples (index 0 — default global view)
      var btnAll = document.getElementById('slice-btn-all');
      btnAll.addEventListener('click', function() {
        filterState.slice.category = null;
        filterState.slice.group    = null;
        renderView();
      });
      btnAll.addEventListener('keydown', function(e) {
        handleCategoryButtonKeydown(e, 0);
      });

      // Category button: Project (index 1)
      var btnProject = document.getElementById('slice-btn-project');
      btnProject.addEventListener('click', function() {
        handleCategoryClick(SLICE_CATEGORIES.PROJECT);
      });
      btnProject.addEventListener('keydown', function(e) {
        handleCategoryButtonKeydown(e, 1);
      });

      // Category button: Location / Hub (index 2)
      var btnLocation = document.getElementById('slice-btn-location');
      btnLocation.addEventListener('click', function() {
        handleCategoryClick(SLICE_CATEGORIES.LOCATION);
      });
      btnLocation.addEventListener('keydown', function(e) {
        handleCategoryButtonKeydown(e, 2);
      });

      // Category button: Lab Group (index 3)
      var btnLabgroup = document.getElementById('slice-btn-labgroup');
      btnLabgroup.addEventListener('click', function() {
        handleCategoryClick(SLICE_CATEGORIES.LAB_GROUP);
      });
      btnLabgroup.addEventListener('keydown', function(e) {
        handleCategoryButtonKeydown(e, 3);
      });

      // Group list item click and keydown — delegated on each list
      function wireGroupList(listId, ownerBtnId) {
        var listEl = document.getElementById(listId);
        listEl.addEventListener('click', function(e) {
          var li = e.target.closest('[role="option"]');
          if (!li) return;
          handleGroupItemClick(li.getAttribute('data-group-id'));
        });
        listEl.addEventListener('keydown', function(e) {
          var li = e.target.closest('[role="option"]');
          if (!li) return;
          handleGroupItemKeydown(e, li, listEl, ownerBtnId);
        });
      }

      wireGroupList('project-group-list',  'slice-btn-project');
      wireGroupList('location-group-list', 'slice-btn-location');
      wireGroupList('labgroup-group-list', 'slice-btn-labgroup');

      // Populate sidebar group lists from data
      populateSidebarGroupLists(data);

      // -- Existing charts --
      renderKPIs(data.kpis);
      if (data.data_management) { renderDataManagement(data.data_management); }
      renderTemporalChart(data.temporal);
      renderDonutChart(data.sample_types);
      renderPipelineChart(data.pipeline);
      renderBySiteChart(data.by_site);
      renderMap(data.sites);

      // Global tag badges — sum of tag_groups counts across all project entries
      globalTagsDict = {};
      if (data.slice_views && Array.isArray(data.slice_views.project)) {
        data.slice_views.project.forEach(function(e) {
          if (e.tag_groups && typeof e.tag_groups === 'object') {
            Object.keys(e.tag_groups).forEach(function(colLabel) {
              if (!globalTagsDict[colLabel]) { globalTagsDict[colLabel] = {}; }
              var tokenCounts = e.tag_groups[colLabel];
              if (tokenCounts && typeof tokenCounts === 'object') {
                Object.keys(tokenCounts).forEach(function(token) {
                  globalTagsDict[colLabel][token] = (globalTagsDict[colLabel][token] || 0) + tokenCounts[token];
                });
              }
            });
          }
        });
      }
      renderTagGroups('globalReplicateBadges', globalTagsDict);

      var samplerMap = {};
      if (data.slice_views && Array.isArray(data.slice_views.project)) {
        data.slice_views.project.forEach(function(e) {
          if (Array.isArray(e.sampler_type_dist)) {
            e.sampler_type_dist.forEach(function(d) {
              samplerMap[d.sampler] = (samplerMap[d.sampler] || 0) + d.count;
            });
          }
        });
      }
      var globalSamplerDist = Object.keys(samplerMap)
        .map(function(k) { return { sampler: k, count: samplerMap[k] }; })
        .sort(function(a, b) { return b.count - a.count; });
      destroyChart('globalSamplerChart');
      renderSamplerTypeChart('globalSamplerChart', globalSamplerDist);

      buildFilterOptions(data.all_samples);
      tableCurrentPage = 1;
      renderTable(data.all_samples, 1);

      renderFooterDate(data.meta && data.meta.generated ? data.meta.generated : '');

      showContent();
      // Leaflet must recalculate dimensions after parent becomes visible
      if (leafletMap) { leafletMap.invalidateSize(); }
      initScrollSpy();

      // Wire up filter dropdowns
      document.getElementById('filter-category').addEventListener('change', function() {
        tableCurrentPage = 1;
        renderTable(appData.all_samples, 1);
      });
      document.getElementById('filter-site').addEventListener('change', function() {
        tableCurrentPage = 1;
        renderTable(appData.all_samples, 1);
      });
      document.getElementById('filter-year').addEventListener('change', function() {
        tableCurrentPage = 1;
        renderTable(appData.all_samples, 1);
      });
      var stageFilterEl = document.getElementById('filter-stage');
      if (stageFilterEl) {
        stageFilterEl.addEventListener('change', function() {
          tableCurrentPage = 1;
          renderTable(appData.all_samples, 1);
        });
      }

      // Initial render pass — shows default 7-chart view
      renderView();
    }

    // =============================================================================
    // SIDEBAR COLLAPSE TOGGLE — desktop only (wrapper hidden below lg breakpoint)
    // =============================================================================
    (function () {
      var sidebarWrapper = document.getElementById('slice-sidebar-wrapper');
      var sidebar        = document.getElementById('slice-sidebar');
      var collapseBtn    = document.getElementById('slice-collapse-btn');
      var collapseIcon   = document.getElementById('slice-collapse-icon');
      if (!sidebarWrapper || !collapseBtn || !collapseIcon || !sidebar) return;

      var isCollapsed = false;

      collapseBtn.addEventListener('click', function () {
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
          // Collapse both wrapper AND the aside itself — the aside keeps its
          // Tailwind w-64 (16rem) otherwise and visually overflows the 0-width
          // wrapper, overlaying the dashboard body.
          sidebar.style.overflow = 'hidden';
          sidebar.style.width = '0';
          sidebarWrapper.style.width = '0px';
          collapseIcon.style.transform = 'rotate(180deg)';
          collapseBtn.setAttribute('aria-label', 'Expand filter sidebar');
          collapseBtn.setAttribute('aria-expanded', 'false');
          sidebar.setAttribute('inert', '');
        } else {
          sidebar.style.width = '';
          sidebarWrapper.style.width = '16rem';
          collapseIcon.style.transform = 'rotate(0deg)';
          collapseBtn.setAttribute('aria-label', 'Collapse filter sidebar');
          collapseBtn.setAttribute('aria-expanded', 'true');
          sidebar.removeAttribute('inert');
          // Restore scrollability after transition completes
          setTimeout(function () { sidebar.style.overflow = ''; }, 200);
        }
      });
    }());

    // Fetch with try/catch + shape validation. data.json is the only hard dependency;
    // project-layouts.json is best-effort (failure => projectLayouts stays null => legacy renderer).
    document.addEventListener('DOMContentLoaded', function() {
      var dataP = fetch('data/data.json').then(function(resp) {
        if (!resp.ok) { throw new Error('HTTP ' + resp.status); }
        return resp.text();
      });
      var layoutsP = fetch('data/project-layouts.json')
        .then(function(resp) { return resp.ok ? resp.json() : null; })
        .catch(function() { return null; });   // layouts never block the dashboard
      var overridesP = fetch('data/layout-overrides.json')
        .then(function(resp) { return resp.ok ? resp.json() : null; })
        .catch(function() { return null; });    // hand-authored overrides; absent => no effect
      Promise.all([dataP, layoutsP, overridesP]).then(function(results) {
        var parsed;
        try {
          parsed = JSON.parse(results[0]);
        } catch (parseErr) {
          showError();
          return;
        }
        projectLayouts = results[1] || null;
        layoutOverrides = results[2] || null;
        // Shape validation inside initDashboard
        initDashboard(parsed);
        if (new URLSearchParams(window.location.search).has('verifyLayouts')) { verifyLayoutsOracle(); }
        if (DESIGN_MODE) { wireDesignMode(); }
      }).catch(function() {
        showError();
      });
    });
