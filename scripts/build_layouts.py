#!/usr/bin/env python3
"""Build per-project slice LayoutDescriptors for the BROADN dashboard.

Phase 1 of the complexity review. Formalizes docs/COMPLEXITY-PER-PROJECT-MATRIX.md §4
into concrete, validated data: a safe default LayoutDescriptor whose widgets self-suppress
via `show_if` metadata predicates (matrix §3 rules), plus 20 per-project seed layouts that
layer the matrix §5 project-specific widgets as curated overrides.

Parallels scripts/preprocess_data.py: reads data/data.json, writes data/project-layouts.json.
Validates output against data/layout-schema.json and cross-checks the rule-derived
keep/cut grid against the matrix §2 hand-authored verdicts (divergences are reported, not
fatal — they mark where human judgment used project semantics a pure metadata rule can't).

Run:  python3 scripts/build_layouts.py
"""
import io, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "data.json")
SCHEMA = os.path.join(ROOT, "data", "layout-schema.json")
OUT = os.path.join(ROOT, "data", "project-layouts.json")

KNOWN_TAG_GROUPS = ["AM/PM", "Replicate", "Position", "Quadrant", "Field Control"]


# --------------------------------------------------------------------------- facts
def month_idx(m):
    y, mm = m.split("-")
    return int(y) * 12 + int(mm)


def compute_facts(p):
    n = p.get("sample_count", 0) or 0
    st = p.get("sample_types", [])
    sd = p.get("sampler_type_dist", [])
    pl = p.get("pipeline", {}) or {}
    tmp = p.get("temporal", [])
    tg = p.get("tag_groups", {}) or {}
    months = sorted(t["month"] for t in tmp)
    seq_idx = [month_idx(m) for m in months]
    contiguous = all(seq_idx[i + 1] - seq_idx[i] == 1 for i in range(len(seq_idx) - 1))
    coll, ext, seq = pl.get("collected", 0), pl.get("dna_extracted", 0), pl.get("sequenced", 0)
    cov = sum(x["count"] for x in sd)
    return {
        # identity field across slice kinds (project_id | group_name | site_code)
        "project_id": p.get("project_id") or p.get("group_name") or p.get("site_code"),
        "sample_count": n,
        "sample_types_distinct": len(st),
        "samplers_distinct": len(sd),
        "sampler_coverage_ratio": (cov / n) if n else 0.0,
        "months": len(months),
        "contiguous": contiguous,
        "top_month_share": (max((t["count"] for t in tmp), default=0) / n) if n else 0.0,
        "collected": coll, "dna_extracted": ext, "sequenced": seq,
        "stages_all_equal": (coll == ext == seq) and n > 0,
        "populated_tag_groups": [k for k, v in tg.items() if v],
        "time_distribution_periods": len(p.get("time_distribution") or []),
        "has_type_pipeline_crosstab": bool(p.get("type_pipeline_crossTab")),
    }


# --------------------------------------------------------- show_if predicate evaluator
def eval_show_if(cond, f):
    """Evaluate a ShowIf predicate object against a facts dict. Mirrors the runtime contract."""
    if cond is None:
        return True
    if "all" in cond:
        return all(eval_show_if(c, f) for c in cond["all"])
    if "any" in cond:
        return any(eval_show_if(c, f) for c in cond["any"])
    if "not" in cond:
        return not eval_show_if(cond["not"], f)
    p = cond["predicate"]
    if p == "always":
        return True
    if p == "distinct_gte":
        key = {"sample_types": "sample_types_distinct", "sampler": "samplers_distinct"}[cond["field"]]
        return f[key] >= cond["value"]
    if p == "field_eq":
        return f[cond["field"]] == cond["value"]
    if p == "field_gt":
        return f[cond["field"]] > cond["value"]
    if p == "all_equal":
        return f["stages_all_equal"]
    if p == "coverage_gte":
        return f["sampler_coverage_ratio"] >= cond["value"]
    if p == "tag_group_nonempty":
        return cond["name"] in f["populated_tag_groups"]
    if p == "months_gte":
        return f["months"] >= cond["value"]
    if p == "contiguous_months":
        return f["contiguous"]
    if p == "top_share_lt":
        return f["top_month_share"] < cond["value"]
    raise ValueError("unknown predicate %r" % p)


# ---------------------------------------------------------------- baseline (rule) widgets
def baseline_widgets():
    """The default widget set with show_if predicates straight from matrix §3.
    Same list seeds every project; show_if makes it self-suppress per metadata."""
    return [
        {"id": "overview_stats", "type": "stat_strip", "title": "At a glance", "size": "md",
         "show_if": {"predicate": "always"},
         "data_binding": {"source": "sample_count"},
         "annotations": {"caption": "Headline counts; absorbs facts cut from degenerate charts."}},

        {"id": "sample_types", "type": "doughnut", "title": "Sample Types", "size": "md",
         "show_if": {"predicate": "distinct_gte", "field": "sample_types", "value": 3},
         "data_binding": {"source": "sample_types"},
         "annotations": {"caption": "Shown only with >=3 substrate values (else folded into At a glance)."}},

        {"id": "pipeline", "type": "pipeline_bar", "title": "Processing Pipeline", "size": "md",
         "show_if": {"not": {"predicate": "all_equal"}},
         "data_binding": {"source": "pipeline"},
         "annotations": {"empty_state": "Collected — processing not yet begun.",
                         "caption": "Funnel when stages differ; explicit empty-state when sequenced == 0."}},

        {"id": "pipeline_complete", "type": "completion_badge", "title": "Fully processed", "size": "sm",
         "show_if": {"predicate": "all_equal"},
         "data_binding": {"source": "pipeline"},
         "annotations": {"caption": "Replaces a flat three-equal-bar pipeline with one completion stat."}},

        {"id": "temporal", "type": "temporal_bar", "title": "Collection Over Time", "size": "md",
         "show_if": {"all": [{"predicate": "months_gte", "value": 2},
                              {"predicate": "top_share_lt", "value": 0.85}]},
         "data_binding": {"source": "temporal", "transform": "group_by_year"},
         "annotations": {"caption": "Gap-aware; suppressed for single-month or single-month-dominated projects."}},

        {"id": "sampler", "type": "bar", "title": "Sampler Types", "size": "md",
         "show_if": {"all": [{"predicate": "distinct_gte", "field": "sampler", "value": 2},
                             {"predicate": "coverage_gte", "field": "sampler", "value": 0.95}]},
         "data_binding": {"source": "sampler_type_dist", "transform": "sort_desc", "denominator": "sample_count"},
         "annotations": {"unspecified_remainder": True,
                         "caption": "Default shows only with >=2 samplers AND near-full coverage; eval campaigns promote it via override."}},

        {"id": "tags", "type": "badge_row", "title": "Replicate & Design Tags", "size": "sm",
         "show_if": {"any": [{"predicate": "tag_group_nonempty", "name": nm} for nm in KNOWN_TAG_GROUPS]},
         "data_binding": {"source": "tag_groups"},
         "annotations": {"caption": "Suppressed when no tag group is populated; a populated dimension may be promoted to its own chart via override."}},
    ]


def banner():
    return {"enabled": True, "content_source": "PROJECT_CONTENT",
            "suppress_if_null": True, "no_fabricate": True,
            "absorbed_stats": []}


def layout(slice_kind, key_field, label_field, widgets):
    return {"slice_kind": slice_kind, "slice_key_field": key_field,
            "slice_label_field": label_field, "banner": banner(), "widgets": widgets}


# -------------------------------------------------------- curated, project-specific extras
# Matrix §5 widgets that pure metadata can't derive (semantic: "what is THIS project's hero").
# Each entry: extra widget descriptors to insert, and an optional sampler promotion flag.
def grouped_bar(id_, title, source):
    return {"id": id_, "type": "grouped_bar", "title": title, "size": "md",
            "data_binding": {"source": source, "transform": "crosstab"}}

def heat(id_, title, source):
    return {"id": id_, "type": "heat_strip", "title": title, "size": "lg",
            "data_binding": {"source": source}}

def tagbar(id_, title, group):
    return {"id": id_, "type": "bar", "title": title, "size": "md",
            "data_binding": {"source": "tag_groups." + group}}

def link_chip(id_="publications"):
    return {"id": id_, "type": "link_chip", "title": "Publications & Data", "size": "sm",
            "data_binding": {"source": "PROJECT_CONTENT.publications"},
            "annotations": {"caption": "Reference-only; renders only from a real accession/DOI (no_fabricate)."}}

def control_callout():
    return {"id": "control_identity", "type": "stat", "title": "Control set", "size": "sm",
            "data_binding": {"source": "tag_groups.Field Control"},
            "annotations": {"caption": "Names what this control slice is (e.g. Field Control N/N)."}}

EVAL_CAMPAIGNS = {
    "Spring SASS/Polycarbonate Top/Bottom", "Spring Sass/VIVAS", "BACS", "2024 Summer",
}

# project_id -> list of extra widgets (inserted after stat_strip / promoted sampler)
OVERRIDES = {
    "Fall Plant Circle": [heat("quadrant_matrix", "Quadrant Processing Gradient", "tag_charts.Quadrant"),
                          grouped_bar("pipeline_by_type", "Pipeline by Substrate", "type_pipeline_crossTab")],
    "Spring Plant Circle": [heat("quadrant_matrix", "Quadrant Sampling Grid", "tag_charts.Quadrant"),
                            grouped_bar("pipeline_by_type", "Pipeline by Substrate", "type_pipeline_crossTab")],
    "Fall Plants & Soil": [grouped_bar("pipeline_by_type", "Pipeline by Substrate", "type_pipeline_crossTab")],
    "Spring Plants & Soil": [grouped_bar("pipeline_by_type", "Pipeline by Substrate (Soil bottleneck)", "type_pipeline_crossTab")],
    "ARDEC Pilot Study": [grouped_bar("pipeline_by_type", "Pipeline by Substrate", "type_pipeline_crossTab")],
    "Flux": [tagbar("height_bar", "Height (Top / Bottom)", "Position")],
    "Two Towers": [tagbar("height_bar", "Height (Top / Mid / Bottom)", "Replicate")],
    "2022 Fall CPER": [tagbar("position_bar", "Tower Position (A / B / C)", "Position")],
    "2022 Fall CPER Control": [control_callout()],
    "Spring SASS/Polycarbonate Top/Bottom": [grouped_bar("sampler_pipeline", "Sampler x Pipeline", "sampler_type_dist")],
    "Spring Sass/VIVAS": [grouped_bar("sampler_pipeline", "Sampler x Pipeline", "sampler_type_dist")],
    "Optimization Tests": [grouped_bar("replicate_compare", "Replicate A/B Pipeline", "tag_charts.Replicate")],
}
PUBLICATION_PROJECTS = {"Fragmented Landscape", "BACS", "Ice-Nucleating Particles", "Two Towers", "2024 Summer"}


def build_project_layout(facts):
    pid = facts["project_id"]
    widgets = [w.copy() for w in baseline_widgets()]
    # Eval-campaign sampler promotion: force-show + lg + move to front (after stat_strip).
    if pid in EVAL_CAMPAIGNS:
        for w in widgets:
            if w["id"] == "sampler":
                w["show_if"] = {"all": [{"predicate": "distinct_gte", "field": "sampler", "value": 2}]}
                w["size"] = "lg"
                w["title"] = "Sampler Comparison (campaign focus)"
    # Assemble ordering: stat_strip, [promoted sampler], curated extras, remaining baseline, link_chip.
    by_id = {w["id"]: w for w in widgets}
    ordered = [by_id["overview_stats"]]
    if pid in EVAL_CAMPAIGNS:
        ordered.append(by_id["sampler"])
    ordered.extend(OVERRIDES.get(pid, []))
    for w in widgets:
        if w["id"] in ("overview_stats",):
            continue
        if pid in EVAL_CAMPAIGNS and w["id"] == "sampler":
            continue
        ordered.append(w)
    if pid in PUBLICATION_PROJECTS:
        ordered.append(link_chip())
    return layout("project", "project_id", "project_id", ordered)


# ----------------------------------------------------- lab_group + location (Phase 2b)
def labgroup_widgets():
    # Lab-group is a project-clone (HAS pipeline; key==label==group_name). Baseline has no link_chip.
    return [w.copy() for w in baseline_widgets()]


def build_labgroup_layout(facts):
    return layout("lab_group", "group_name", "group_name", labgroup_widgets())


def location_widgets():
    # Location has NO pipeline -> structurally OMIT pipeline_bar + completion_badge (do NOT rely on
    # show_if: stages_all_equal computes TRUE on a missing/zero pipeline). Prepend sub_sites (after the
    # overview stat strip), append the optional time-of-day chart.
    base = [w.copy() for w in baseline_widgets() if w["id"] not in ("pipeline", "pipeline_complete")]
    sub = {"id": "sub_sites", "type": "sub_sites", "title": "Sub-Locations", "size": "md",
           "show_if": {"predicate": "always"}, "data_binding": {"source": "sub_sites"}}
    tod = {"id": "time_of_day", "type": "time_of_day", "title": "Time of Day", "size": "md",
           "show_if": {"predicate": "field_gt", "field": "time_distribution_periods", "value": 0},
           "data_binding": {"source": "time_distribution"}}
    # overview_stats (base[0]) stays first, then sub_sites, then the rest, then time_of_day.
    return [base[0], sub] + base[1:] + [tod]


def build_location_layout(facts):
    return layout("location", "site_code", "site_name", location_widgets())


# ------------------------------------------------------------ matrix §2 cross-check grid
# present(K/T) vs absent(C) per the hand-authored matrix §2 table.
MATRIX = {
    "IMPROVE Fungi": "C K T C C", "Fragmented Landscape": "K C T C C",
    "Fall Plant Circle": "T K C T T", "Spring Plant Circle": "K T T C T",
    "Fall Plants & Soil": "T T C C K", "Flux": "C T K C T",
    "Spring SASS/Polycarbonate Top/Bottom": "C K T T C", "BACS": "C K T K T",
    "Spring Sass/VIVAS": "T K T K T", "Ice-Nucleating Particles": "C K K T C",
    "Spring Chemistry": "C T K C C", "Spring Plants & Soil": "K T T C T",
    "2022 Fall CPER": "C T T C T", "2024 Summer": "T T T K C",
    "Two Towers": "C T K C T", "Optimization Tests": "C T T T T",
    "Spring SKC": "C K K C C", "2022 Fall CPER Control": "C K T C T",
    "ARDEC Pilot Study": "K K C T T", "2022 Fall CPER Extra": "C C C C T",
}
MATRIX_COLS = ["sample_types", "pipeline", "temporal", "sampler", "tags"]


def rule_grid(facts):
    """Derive present/absent per matrix column from the baseline show_if rules + curation."""
    w = {x["id"]: x for x in baseline_widgets()}
    pid = facts["project_id"]
    sampler_show = w["sampler"]["show_if"]
    if pid in EVAL_CAMPAIGNS:
        sampler_show = {"predicate": "distinct_gte", "field": "sampler", "value": 2}
    return {
        "sample_types": eval_show_if(w["sample_types"]["show_if"], facts),
        # pipeline present in some form on every project that isn't a trivial flat tiny set
        "pipeline": eval_show_if(w["pipeline"]["show_if"], facts) or eval_show_if(w["pipeline_complete"]["show_if"], facts),
        "temporal": eval_show_if(w["temporal"]["show_if"], facts),
        "sampler": eval_show_if(sampler_show, facts),
        "tags": eval_show_if(w["tags"]["show_if"], facts),
    }


def main():
    data = json.load(io.open(DATA, encoding="utf-8"))
    projects = data["slice_views"]["project"]
    facts_all = [compute_facts(p) for p in projects]
    lg_facts = [compute_facts(p) for p in data["slice_views"].get("lab_group", [])]
    loc_facts = [compute_facts(p) for p in data["slice_views"].get("location", [])]

    out = {
        "version": "1.0.0",
        "generated_by": "scripts/build_layouts.py (complexity-review Phase 1/2b)",
        "default": layout("project", "project_id", "project_id", baseline_widgets()),
        "projects": {f["project_id"]: build_project_layout(f) for f in facts_all},
        # Phase 2b — additive top-level keys (project default/projects above stay byte-identical)
        "lab_groups": {f["project_id"]: build_labgroup_layout(f) for f in lg_facts},
        "lab_group_default": layout("lab_group", "group_name", "group_name", labgroup_widgets()),
        "locations": {f["project_id"]: build_location_layout(f) for f in loc_facts},
        "location_default": layout("location", "site_code", "site_name", location_widgets()),
    }

    # Hazard guard: no location layout may carry pipeline widgets (location has no pipeline data).
    for key, lay in list(out["locations"].items()) + [("location_default", out["location_default"])]:
        ids = [w["id"] for w in lay["widgets"]]
        assert "pipeline" not in ids and "pipeline_complete" not in ids, \
            "location layout %s must omit pipeline widgets" % key

    # Parity oracle reference: `python3 scripts/build_layouts.py visibility` prints the per-slice
    # visible-widget grid the runtime evalShowIf must reproduce exactly (all three kinds).
    if "visibility" in sys.argv[1:]:
        grid = {}

        def emit(layouts_map, facts_list):
            fb = {f["project_id"]: f for f in facts_list}
            for key, lay in layouts_map.items():
                f = fb[key]
                grid[key] = [w["id"] for w in lay["widgets"] if eval_show_if(w.get("show_if"), f)]

        emit(out["projects"], facts_all)
        emit(out["lab_groups"], lg_facts)
        emit(out["locations"], loc_facts)
        print(json.dumps(grid, sort_keys=True))
        return

    # 1) Schema validation.
    schema = json.load(io.open(SCHEMA, encoding="utf-8"))
    try:
        from jsonschema import Draft202012Validator
        errs = sorted(Draft202012Validator(schema).iter_errors(out), key=lambda e: e.path)
        if errs:
            print("SCHEMA VALIDATION FAILED:")
            for e in errs[:20]:
                print("  -", list(e.path), e.message)
            sys.exit(1)
        print("schema validation: PASS (%d project layouts + default)" % len(out["projects"]))
    except ImportError:
        print("schema validation: SKIPPED (jsonschema not installed)")

    # 2) Cross-check rule-derived grid vs matrix §2.
    match = miss = 0
    divergences = []
    for f in facts_all:
        grid = rule_grid(f)
        truth = MATRIX[f["project_id"]].split()
        for i, col in enumerate(MATRIX_COLS):
            present_rule = grid[col]
            present_matrix = truth[i] in ("K", "T")
            if present_rule == present_matrix:
                match += 1
            else:
                miss += 1
                divergences.append("%-34s %-13s rule=%s matrix=%s"
                                   % (f["project_id"][:34], col,
                                      "show" if present_rule else "hide", truth[i]))
    total = match + miss
    print("matrix cross-check: %d/%d cells agree (%.0f%%) on present/absent"
          % (match, total, 100.0 * match / total))
    if divergences:
        print("  divergences (rule vs human judgment — expected on semantic calls):")
        for d in divergences:
            print("   ", d)

    json.dump(out, io.open(OUT, "w", encoding="utf-8"), indent=2)
    print("wrote", os.path.relpath(OUT, ROOT))


if __name__ == "__main__":
    main()
