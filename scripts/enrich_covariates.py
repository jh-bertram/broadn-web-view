#!/usr/bin/env python3
"""
enrich_covariates.py — BROADN build-time weather-covariate enrichment
(Phase 1.5, broadn-p15 — supersedes the Phase 1/p14 point-in-time scalar).

Attaches concurrent MIxS-Air weather covariates (temp, humidity, wind_speed,
wind_direction, barometric_press, precipitation) to each Field Sample row by
querying the Open-Meteo historical archive API, keyed on each sample's
(corrected) collection coordinate + collection WINDOW. Output is a
committed, reproducible side-file: `data/covariates.json` (+ a committed
response cache `data/cache/covariates-cache.json`). The static site itself
is untouched — this is build-time metadata, not part of the reference-only
results surface.

Standalone reader (intentional duplication of preprocess_data.load_xlsx() and
its column literals, NOT a DRY violation): a separate reader decouples this
build-time enrichment step from scripts/preprocess_data.py so a change to one
pipeline can never silently break the other; see load_field_samples() below.

TWO p15 CORRECTIONS over p14:

  1. LONGITUDE SIGN-FIX. ~402 field samples have a positive longitude (a
     sign-flip data-entry error) which p14 treated as an unfixable bad coord.
     Any positive longitude is negated (coord_corrected=true) and the
     CORRECTED coordinate is used for the fetch, grid resolution and
     offset_km. If the negated coordinate still isn't inside the continental
     US bounding box, it's still flagged coord_corrected=true but treated as
     a bad coord (fetch_status="skipped_bad_coord") rather than queried.
     Null/NaN lat or lon remains an unfixable bad coord (coord_corrected
     stays false). See correct_coord().

  2. WINDOW AGGREGATION replaces the p14 point-in-time hourly scalar.
     Samples are time-INTEGRATED (mostly 24h, some 12h/6h/4h/multi-day), so
     the p14 single nearest-hour reading was never representative. Every
     dated + valid-coord sample now resolves to a [window_start, window_end)
     local-time interval and a `covariates` aggregate over exactly the
     hourly points inside it, per the FOUR TIME-FIDELITY TIERS below
     (evaluated in this fixed, mutually-exclusive precedence — a
     timed-but-undated row is "no_date", never a window tier):

       1. no_date             — no valid Sample Collected Date -> no window,
                                 all covariates null.
       2. window_exact        — date + parseable time + duration>0 ->
                                 window = [date+time, date+time+duration).
                                 duration_source="measured".
       3. window_assumed_24h  — date + time, duration missing/0.0 (thirty
                                 rows are exactly 0.0 -> treated as unknown)
                                 -> window = [date+time, date+time+24h).
                                 duration_source="assumed_24h" (flagged; most
                                 samples genuinely are ~24h, but this IS an
                                 assumption for this row).
       4. date_only           — date, no time (regardless of duration column
                                 value — without a start clock time the
                                 window can't be placed) -> window = the
                                 sample's full local calendar day
                                 [date 00:00, date+1 00:00). duration_source
                                 ="none".

     `covariates_daily` is KEPT as a stable reference field for every dated
     + valid-coord sample: the aggregate over the sample's full calendar day
     (same rules), which for the date_only tier is numerically identical to
     `covariates` (same window).

UNIT CONVERSION happens EXACTLY ONCE per unique fetch key, on the raw hourly
arrays immediately after they are obtained (live fetch OR cache hit),
strictly BEFORE any aggregation:
  wind_speed_10m (km/h)   -> wind_speed (m/s),        divide by 3.6
  surface_pressure (hPa)  -> barometric_press (kPa),  divide by 10
temperature_2m, relative_humidity_2m, wind_direction_10m, precipitation are
already in the target MIxS-Air units and pass through unchanged.

DEDUP + CACHE: samples are grouped by
  (round(lat, 2), round(lon, 2), fetch_start_date, fetch_end_date)
using the CORRECTED coordinate. A window spanning >1 calendar day pulls a
multi-day range in ONE archive request; the fetched date range is part of
the key so a 2-day window is never conflated with a 1-day window at the same
site. Every unique key's raw response is cached in a single committed file
(data/cache/covariates-cache.json) so a second run is 100% offline (zero
network calls).
"""

import json
import math
import sys
import time
import warnings
from datetime import datetime, timedelta
from pathlib import Path
from statistics import mean

import pandas as pd
import requests

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parent.parent
XLSX_PATH = REPO_ROOT / "Bdb-317.xlsx"
OUTPUT_PATH = REPO_ROOT / "data" / "covariates.json"
CACHE_PATH = REPO_ROOT / "data" / "cache" / "covariates-cache.json"

# ── Column literals ──────────────────────────────────────────────────────────
# Verified on-disk against scripts/preprocess_data.py (L57-90); duplicated here
# intentionally (see module docstring "Standalone reader" note above).
COL_BROADN_ID = "BROADN ID"
COL_SAMPLE_CATEGORY = "Sample Category"
COL_COLLECTED_DATE = "Sample Collected Date"
COL_COLLECTED_TIME = "Sample Collected Time"
COL_COLLECTION_DURATION = "Sample Collection Duration"
COL_LATITUDE = "Latitude"
COL_LONGITUDE = "Longitude"
FIELD_SAMPLE_CATEGORY = "Field Sample"

# ── Open-Meteo contract (live-verified 2026-07-06, unchanged in p15) ───────
API_BASE_URL = "https://archive-api.open-meteo.com/v1/archive"
HOURLY_VARS = (
    "temperature_2m,relative_humidity_2m,precipitation,"
    "wind_speed_10m,wind_direction_10m,surface_pressure"
)
USER_AGENT = (
    "BROADN-WebView-CovariateEnrichment/1.1 "
    "(+https://github.com/jh-bertram/broadn-web-view; build-time static-site enrichment)"
)

# ── Tunable constants ────────────────────────────────────────────────────────
DEDUP_PRECISION = 2   # round(lat/lon, 2) ~= 1.1 km grid; fine enough to keep sites distinct
FLOAT_PRECISION = 4    # fixed decimal places for deterministic serialization
THROTTLE_SECONDS = 0.3
MAX_RETRIES = 4
BACKOFF_BASE_SECONDS = 1.0

# Continental-US bounding box used only to sanity-check a NEGATED longitude
# (correct_coord() below) — a fixed geographic fact, not a value derived from
# (and thus not subject to going stale with) the xlsx source data.
US_LAT_MIN, US_LAT_MAX = 24.0, 50.0
US_LON_MIN, US_LON_MAX = -125.0, -66.0

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": USER_AGENT})


# ── XLSX reader ──────────────────────────────────────────────────────────────
def load_field_samples() -> pd.DataFrame:
    """Load Bdb-317.xlsx and filter to Field Sample rows (mirrors
    preprocess_data.load_xlsx()/its warnings-suppression; see module
    docstring for why this is a deliberate standalone duplication)."""
    if not XLSX_PATH.exists():
        print(f"ERROR: xlsx not found at {XLSX_PATH}", file=sys.stderr)
        sys.exit(1)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        df = pd.read_excel(XLSX_PATH, engine="openpyxl")
    return df[df[COL_SAMPLE_CATEGORY] == FIELD_SAMPLE_CATEGORY].copy()


# ── Coordinate correction (p15 correction 1) ────────────────────────────────
def correct_coord(lat: object, lon: object) -> dict:
    """Resolve a sample's TRUE collection coordinate, correcting the known
    positive-longitude sign-flip data-entry error (verified recon: n=402
    field samples, all negate cleanly into the continental US).

    Returns {"lat", "lon", "coord_corrected", "coord_status"}:
      - null/NaN lat or lon        -> lat/lon None, corrected=False, "skipped_bad_coord".
      - lon > 0                    -> negate lon, corrected=True; then if the
                                       negated point is inside US bounds,
                                       status="ok", else "skipped_bad_coord"
                                       (still corrected=True — the sign was
                                       flipped, it just didn't land in a
                                       plausible place; don't query garbage).
      - lon <= 0 (already correct) -> pass through, corrected=False, "ok".
    """
    if pd.isna(lat) or pd.isna(lon):
        return {"lat": None, "lon": None, "coord_corrected": False, "coord_status": "skipped_bad_coord"}
    lat_f, lon_f = float(lat), float(lon)
    corrected = lon_f > 0
    if corrected:
        lon_f = -lon_f
    in_bounds = US_LAT_MIN <= lat_f <= US_LAT_MAX and US_LON_MIN <= lon_f <= US_LON_MAX
    status = "ok" if (in_bounds or not corrected) else "skipped_bad_coord"
    return {"lat": lat_f, "lon": lon_f, "coord_corrected": corrected, "coord_status": status}


# ── Window classification (p15 correction 2) ────────────────────────────────
def parse_time_value(val: object) -> tuple[int, int] | None:
    """Parse a datetime.time object or 'HH:MM' string into (hour, minute).
    Returns None if null/unparseable."""
    if pd.isna(val):
        return None
    if hasattr(val, "hour"):
        return val.hour, getattr(val, "minute", 0)
    try:
        parts = str(val).split(":")
        return int(parts[0]), int(parts[1]) if len(parts) > 1 else 0
    except (ValueError, IndexError):
        return None


def parse_duration_hours(val: object) -> float | None:
    """Parse 'Sample Collection Duration' (decimal hours). Null or <=0.0 is
    treated as "not recorded" (verified recon: thirty rows are exactly 0.0)."""
    if pd.isna(val):
        return None
    dur = float(val)
    return dur if dur > 0 else None


def classify_window(date_val: object, time_val: object, duration_val: object) -> dict:
    """Classify one sample's time_fidelity tier + local collection window,
    per the fixed no_date -> window_exact -> window_assumed_24h -> date_only
    precedence documented in the module docstring.

    Returns {"tier", "duration_hours", "duration_source", "window_start",
    "window_end"} — window_start/window_end are naive local datetimes (or
    None for "no_date")."""
    if pd.isna(date_val):
        return {"tier": "no_date", "duration_hours": None, "duration_source": None,
                 "window_start": None, "window_end": None}

    day_start = datetime(date_val.year, date_val.month, date_val.day)
    hm = parse_time_value(time_val)
    duration = parse_duration_hours(duration_val)

    if hm is not None and duration is not None:
        start = day_start + timedelta(hours=hm[0], minutes=hm[1])
        return {"tier": "window_exact", "duration_hours": duration, "duration_source": "measured",
                 "window_start": start, "window_end": start + timedelta(hours=duration)}
    if hm is not None:
        start = day_start + timedelta(hours=hm[0], minutes=hm[1])
        return {"tier": "window_assumed_24h", "duration_hours": 24.0, "duration_source": "assumed_24h",
                 "window_start": start, "window_end": start + timedelta(hours=24)}
    return {"tier": "date_only", "duration_hours": None, "duration_source": "none",
             "window_start": day_start, "window_end": day_start + timedelta(hours=24)}


def compute_fetch_date_range(window_start: datetime, window_end: datetime) -> tuple[str, str]:
    """ISO (start_date, end_date) calendar days needed to cover the
    half-open [window_start, window_end) in one Open-Meteo request. A window
    whose end lands exactly on local midnight needs no hours from that
    midnight's calendar day, so that trailing day is dropped (avoids an
    unnecessary extra API day, e.g. for the date_only tier's exact-midnight
    window end)."""
    start_date = window_start.date()
    end_date = window_end.date()
    if window_end.hour == 0 and window_end.minute == 0 and end_date > start_date:
        end_date -= timedelta(days=1)
    return start_date.isoformat(), end_date.isoformat()


# ── Geometry / stats helpers ─────────────────────────────────────────────────
def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in km (used for per-sample offset_km)."""
    r = 6371.0088
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def circular_mean_deg(degrees: list[float]) -> float:
    """Circular mean of a list of compass degrees, normalized to [0, 360).
    Required for wind_direction aggregation — an arithmetic mean of
    e.g. [350, 10] would wrongly average to 180 instead of ~0/360."""
    radians = [math.radians(d) for d in degrees]
    sin_sum = sum(math.sin(r) for r in radians)
    cos_sum = sum(math.cos(r) for r in radians)
    mean_rad = math.atan2(sin_sum / len(radians), cos_sum / len(radians))
    return math.degrees(mean_rad) % 360


def round_floats(obj: object, dp: int) -> object:
    """Recursively round every float leaf in a nested dict/list to `dp`
    decimal places. Shared by both the committed cache and the final output
    so numeric formatting is stable/diff-friendly across runs (DRY)."""
    if isinstance(obj, float):
        return round(obj, dp)
    if isinstance(obj, dict):
        return {k: round_floats(v, dp) for k, v in obj.items()}
    if isinstance(obj, list):
        return [round_floats(v, dp) for v in obj]
    return obj


# ── Unit conversion (applied exactly once per key, see module docstring) ────
def convert_hourly_units(raw_hourly: dict) -> dict:
    """Return a NEW hourly dict with wind_speed_10m (km/h->m/s) and
    surface_pressure (hPa->kPa) converted. Never mutates the cached raw dict
    (so the committed cache always mirrors the untouched API response)."""
    converted = dict(raw_hourly)
    converted["wind_speed_10m"] = [
        v / 3.6 if v is not None else None for v in raw_hourly["wind_speed_10m"]
    ]
    converted["surface_pressure"] = [
        v / 10.0 if v is not None else None for v in raw_hourly["surface_pressure"]
    ]
    return converted


# ── Cache (single committed file, keyed by dedup key) ───────────────────────
def make_cache_key(lat_r: float, lon_r: float, start_date: str, end_date: str) -> str:
    return f"{lat_r:.2f}_{lon_r:.2f}_{start_date}_{end_date}"


def load_cache() -> dict:
    if CACHE_PATH.exists():
        with open(CACHE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_cache(cache: dict) -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, sort_keys=True, indent=2, ensure_ascii=False)
        f.write("\n")


def fetch_open_meteo_live(lat_r: float, lon_r: float, start_date: str, end_date: str) -> dict | None:
    """Single live Open-Meteo archive request (possibly multi-day) with
    polite throttling and exponential backoff on HTTP 429/5xx. Never raises
    — returns None on unrecoverable failure so the caller can mark
    fetch_status='failed' and the build continues (never aborts on one bad
    fetch)."""
    params = {
        "latitude": lat_r,
        "longitude": lon_r,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": HOURLY_VARS,
        "timezone": "auto",
    }
    delay = BACKOFF_BASE_SECONDS
    for attempt in range(MAX_RETRIES + 1):
        try:
            time.sleep(THROTTLE_SECONDS)
            resp = SESSION.get(API_BASE_URL, params=params, timeout=30)
            if resp.status_code == 200:
                return resp.json()
            if resp.status_code == 429 or 500 <= resp.status_code < 600:
                if attempt < MAX_RETRIES:
                    time.sleep(delay)
                    delay *= 2
                    continue
            print(
                f"  WARNING: Open-Meteo HTTP {resp.status_code} for "
                f"({lat_r},{lon_r},{start_date}..{end_date}) — giving up after {attempt + 1} attempt(s)",
                file=sys.stderr,
            )
            return None
        except requests.RequestException as exc:
            if attempt < MAX_RETRIES:
                time.sleep(delay)
                delay *= 2
                continue
            print(
                f"  WARNING: Open-Meteo request error for ({lat_r},{lon_r},{start_date}..{end_date}): {exc}",
                file=sys.stderr,
            )
            return None
    return None


def get_or_fetch_key(
    lat_r: float, lon_r: float, start_date: str, end_date: str, cache: dict, stats: dict
) -> dict | None:
    """Cache-or-live-fetch a single (lat_r, lon_r, start_date, end_date) key.
    Persists ONLY deterministic fields: RAW hourly arrays + time[] + resolved
    lat/lon/elevation/timezone/utc_offset. `generationtime_ms` is
    deliberately dropped (nondeterministic, would break offline byte-identity)."""
    key = make_cache_key(lat_r, lon_r, start_date, end_date)
    if key in cache:
        stats["cache_hits"] += 1
        return cache[key]
    raw = fetch_open_meteo_live(lat_r, lon_r, start_date, end_date)
    stats["live_calls"] += 1
    if raw is None:
        stats["fetch_failures"] += 1
        return None
    entry = round_floats(
        {
            "resolved_latitude": raw["latitude"],
            "resolved_longitude": raw["longitude"],
            "elevation": raw.get("elevation"),
            "timezone": raw["timezone"],
            "utc_offset_seconds": raw["utc_offset_seconds"],
            "hourly": raw["hourly"],
        },
        FLOAT_PRECISION,
    )
    cache[key] = entry
    return entry


# ── Local-time selection + aggregation ───────────────────────────────────────
def select_window_indices(local_times: list[str], window_start: datetime, window_end: datetime) -> list[int]:
    """Indices into `local_times` (naive local ISO 'YYYY-MM-DDTHH:MM' hourly
    timestamps, possibly spanning multiple days) whose timestamp falls in
    the half-open window [window_start, window_end)."""
    indices = []
    for i, t in enumerate(local_times):
        ts = datetime.strptime(t, "%Y-%m-%dT%H:%M")
        if window_start <= ts < window_end:
            indices.append(i)
    return indices


def first_day_indices(local_times: list[str], start_date: str) -> list[int]:
    """Indices whose local timestamp falls on calendar day `start_date`
    (used for covariates_daily, which is always the sample's own collection
    date — always the FIRST day of any multi-day fetched range)."""
    return [i for i, t in enumerate(local_times) if t.startswith(start_date)]


def utc_time_from_local(local_time_str: str, utc_offset_seconds: int) -> str:
    local_dt = datetime.strptime(local_time_str, "%Y-%m-%dT%H:%M")
    utc_dt = local_dt - timedelta(seconds=utc_offset_seconds)
    return utc_dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def aggregate_covariates(converted_hourly: dict, indices: list[int]) -> dict:
    """Per-variable-correct aggregation over a selected subset of hourly
    indices (a collection window OR a calendar day): precipitation SUMS
    (hourly values are preceding-hour accumulations); wind_direction uses a
    CIRCULAR mean; temp/humidity/wind_speed/barometric_press use an
    arithmetic mean; temp also gets min + max. Shared by both the
    window-scoped `covariates` and the calendar-day `covariates_daily`
    (DRY — a single aggregation rule set, parameterized by which hours)."""

    def clean(key: str) -> list[float]:
        return [converted_hourly[key][i] for i in indices if converted_hourly[key][i] is not None]

    temps = clean("temperature_2m")
    hums = clean("relative_humidity_2m")
    winds = clean("wind_speed_10m")
    dirs = clean("wind_direction_10m")
    press = clean("surface_pressure")
    precip = clean("precipitation")
    return {
        "temp": mean(temps) if temps else None,
        "temp_min": min(temps) if temps else None,
        "temp_max": max(temps) if temps else None,
        "humidity": mean(hums) if hums else None,
        "wind_speed": mean(winds) if winds else None,
        "wind_direction": circular_mean_deg(dirs) if dirs else None,
        "barometric_press": mean(press) if press else None,
        "precipitation": sum(precip) if precip else None,
    }


# ── Per-sample record builder ────────────────────────────────────────────────
def _base_provenance(m: dict) -> dict:
    """Provenance derivable without any network call — shared skeleton for
    every branch (success, skipped_bad_coord, failed, no_date). Caller fills
    in `fetch_status` and, on success, the response-derived fields."""
    window_start = m["window_start"].strftime("%Y-%m-%dT%H:%M") if m["window_start"] else None
    window_end = m["window_end"].strftime("%Y-%m-%dT%H:%M") if m["window_end"] else None
    return {
        "covariate_source": None,
        "grid_lat": None,
        "grid_lon": None,
        "elevation": None,
        "offset_km": None,
        "window_start": window_start,
        "window_end": window_end,
        "window_utc_start": None,
        "window_utc_end": None,
        "window_n_hours": None,
        "duration_hours": m["duration_hours"],
        "duration_source": m["duration_source"],
        "time_fidelity": m["tier"],
        "coord_corrected": m["coord"]["coord_corrected"],
        "timezone": None,
        "utc_offset_seconds": None,
        "fetch_status": None,
    }


def _null_record(m: dict, fetch_status: str) -> dict:
    """Shared null shape for no_date / skipped_bad_coord / failed samples."""
    provenance = _base_provenance(m)
    provenance["fetch_status"] = fetch_status
    return {"covariates": None, "covariates_daily": None, "provenance": provenance}


def build_sample_record(m: dict, key_data: dict, key_daily: dict, key_raw: dict) -> dict:
    """Build one sample's {covariates, covariates_daily, provenance} record
    from its window classification + the shared per-key fetch results."""
    if m["tier"] == "no_date":
        return _null_record(m, fetch_status="no_date")
    if m["coord"]["coord_status"] == "skipped_bad_coord":
        return _null_record(m, fetch_status="skipped_bad_coord")

    converted = key_data.get(m["key"])
    if converted is None:
        return _null_record(m, fetch_status="failed")

    raw_entry = key_raw[m["key"]]
    daily = key_daily[m["key"]]
    coord = m["coord"]
    offset_km = haversine_km(coord["lat"], coord["lon"], raw_entry["resolved_latitude"], raw_entry["resolved_longitude"])

    window_start, window_end = m["window_start"], m["window_end"]
    indices = select_window_indices(raw_entry["hourly"]["time"], window_start, window_end)
    window_cov = aggregate_covariates(converted, indices)
    utc_offset = raw_entry["utc_offset_seconds"]

    provenance = _base_provenance(m)
    provenance.update({
        "covariate_source": "open-meteo-archive",
        "grid_lat": raw_entry["resolved_latitude"],
        "grid_lon": raw_entry["resolved_longitude"],
        "elevation": raw_entry["elevation"],
        "offset_km": offset_km,
        "window_utc_start": utc_time_from_local(window_start.strftime("%Y-%m-%dT%H:%M"), utc_offset),
        "window_utc_end": utc_time_from_local(window_end.strftime("%Y-%m-%dT%H:%M"), utc_offset),
        "window_n_hours": len(indices),
        "timezone": raw_entry["timezone"],
        "utc_offset_seconds": utc_offset,
        "fetch_status": "success",
    })
    return {"covariates": window_cov, "covariates_daily": daily, "provenance": provenance}


# ── Pre-bulk window spot-check ───────────────────────────────────────────────
def run_spot_check(row_meta: dict, cache: dict, stats: dict) -> None:
    """Sanity-check window selection BEFORE the bulk run: pick one
    window_exact sample, fetch its range, and print the resolved window
    bounds/hour-count plus its aggregate vs. the full-day aggregate. A
    printed sanity check, not an assertion."""
    picked = None
    for broadn_id, m in sorted(row_meta.items()):
        if m["tier"] == "window_exact" and m["key"] is not None:
            picked = (broadn_id, m)
            break

    print("\n=== PRE-BULK WINDOW SPOT-CHECK ===")
    if picked is None:
        print("  no eligible window_exact sample found; skipped")
        print("=== END SPOT-CHECK ===\n")
        return

    broadn_id, m = picked
    lat_r, lon_r, start_date, end_date = m["key"]
    raw_entry = get_or_fetch_key(lat_r, lon_r, start_date, end_date, cache, stats)
    if raw_entry is None:
        print(f"  {broadn_id}: fetch failed, cannot spot-check")
        print("=== END SPOT-CHECK ===\n")
        return

    converted = convert_hourly_units(raw_entry["hourly"])
    local_times = raw_entry["hourly"]["time"]
    indices = select_window_indices(local_times, m["window_start"], m["window_end"])
    window_cov = aggregate_covariates(converted, indices)
    daily = aggregate_covariates(converted, first_day_indices(local_times, start_date))
    matched = [local_times[i] for i in indices]
    print(
        f"  {broadn_id} window=[{m['window_start']} .. {m['window_end']}) duration={m['duration_hours']}h "
        f"tz={raw_entry['timezone']} fetched=[{start_date}..{end_date}] n_hours={len(indices)}"
    )
    print(f"  matched local hours: first={matched[0] if matched else None} last={matched[-1] if matched else None}")
    print(
        f"  window covariates: temp_mean={window_cov['temp']} temp_min={window_cov['temp_min']} "
        f"temp_max={window_cov['temp_max']} precip_sum={window_cov['precipitation']}"
    )
    print(f"  full-day reference: temp_min={daily['temp_min']} temp_max={daily['temp_max']}")
    print("=== END SPOT-CHECK ===\n")


# ── main ─────────────────────────────────────────────────────────────────────
def build_row_meta(df: pd.DataFrame) -> dict:
    """Classify every field-sample row (coord correction + window
    classification) independent of any network fetch."""
    row_meta = {}
    for _, row in df.iterrows():
        broadn_id = row[COL_BROADN_ID]
        coord = correct_coord(row[COL_LATITUDE], row[COL_LONGITUDE])
        window = classify_window(row[COL_COLLECTED_DATE], row[COL_COLLECTED_TIME], row[COL_COLLECTION_DURATION])
        key = None
        if window["tier"] != "no_date" and coord["coord_status"] == "ok":
            start_date, end_date = compute_fetch_date_range(window["window_start"], window["window_end"])
            key = (round(coord["lat"], DEDUP_PRECISION), round(coord["lon"], DEDUP_PRECISION), start_date, end_date)
        row_meta[broadn_id] = {**window, "coord": coord, "key": key}
    return row_meta


def main() -> None:
    df = load_field_samples()
    total = len(df)
    print(f"Loaded {total} Field Sample rows from {XLSX_PATH.name}")

    cache = load_cache()
    stats = {"cache_hits": 0, "live_calls": 0, "fetch_failures": 0}

    row_meta = build_row_meta(df)
    run_spot_check(row_meta, cache, stats)

    unique_keys = sorted({m["key"] for m in row_meta.values() if m["key"] is not None})
    print(f"Resolving {len(unique_keys)} unique (lat,lon,start_date,end_date) dedup keys...")
    key_data, key_daily, key_raw = {}, {}, {}
    for lat_r, lon_r, start_date, end_date in unique_keys:
        key = (lat_r, lon_r, start_date, end_date)
        raw_entry = get_or_fetch_key(lat_r, lon_r, start_date, end_date, cache, stats)
        if raw_entry is None:
            key_data[key] = None
            continue
        converted = convert_hourly_units(raw_entry["hourly"])
        key_data[key] = converted
        key_raw[key] = raw_entry
        key_daily[key] = aggregate_covariates(converted, first_day_indices(raw_entry["hourly"]["time"], start_date))

    samples = {}
    tier_counts = {"no_date": 0, "window_exact": 0, "window_assumed_24h": 0, "date_only": 0}
    status_counts = {"no_date": 0, "skipped_bad_coord": 0, "success": 0, "failed": 0}
    coord_corrected_count = 0
    for broadn_id, m in sorted(row_meta.items()):
        tier_counts[m["tier"]] += 1
        if m["coord"]["coord_corrected"]:
            coord_corrected_count += 1
        record = build_sample_record(m, key_data, key_daily, key_raw)
        status_counts[record["provenance"]["fetch_status"]] += 1
        samples[broadn_id] = record

    coverage_summary = {
        "total_field_samples": total,
        "by_time_fidelity": tier_counts,
        "by_fetch_status": status_counts,
        "coord_corrected_count": coord_corrected_count,
        # Deterministic property of the DATASET (how many distinct Open-Meteo
        # calls this build requires), NOT of this particular invocation — a
        # cache-only rerun must report the same number a live run did, or the
        # committed output would never be byte-identical across builds.
        # stats["live_calls"]/["cache_hits"] (this run's actual network
        # activity) are printed to stdout only, never persisted here.
        "unique_api_calls": len(unique_keys),
    }
    meta = {
        "generated_by": "scripts/enrich_covariates.py",
        "source": "open-meteo-archive",
        "source_api": API_BASE_URL,
        "variables": ["temp", "humidity", "wind_speed", "wind_direction", "barometric_press", "precipitation"],
        "units": {
            "temp": "degC",
            "humidity": "percent",
            "wind_speed": "m/s",
            "wind_direction": "degrees",
            "barometric_press": "kPa",
            "precipitation": "mm",
            "precipitation_daily": "mm (sum over local calendar day)",
        },
        "dedup_precision": DEDUP_PRECISION,
        "timezone_mode": "auto",
        "grid_note": (
            "Open-Meteo archive reanalysis is a modeled ~11-25km grid-cell estimate; "
            "sample metadata, not a measured result."
        ),
        "window_note": (
            "`covariates` aggregates the hourly grid over the sample's [window_start, "
            "window_end) local collection window (half-open); `covariates_daily` aggregates "
            "over the sample's full local calendar day as a stable reference. See "
            "provenance.time_fidelity/duration_source for how each window was derived."
        ),
        "coverage_summary": coverage_summary,
    }
    output = round_floats({"meta": meta, "samples": samples}, FLOAT_PRECISION)

    # Prune orphaned entries: the p15 cache key shape (lat,lon,start_date,
    # end_date) differs from p14's (lat,lon,date), so a cache carried over
    # from a p14 run would otherwise accumulate dead single-day entries
    # alongside the live multi-day ones. Keep only what THIS run's dedup
    # keys actually reference (deterministic — same unique_keys every run).
    live_cache_keys = {make_cache_key(*k) for k in unique_keys}
    cache = {k: v for k, v in cache.items() if k in live_cache_keys}

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, sort_keys=True, indent=2, ensure_ascii=False)
        f.write("\n")
    save_cache(cache)

    print(f"\nWrote {OUTPUT_PATH}")
    print(f"coverage_summary: {json.dumps(coverage_summary, sort_keys=True)}")
    print(
        f"cache: {len(cache)} unique keys total "
        f"({stats['cache_hits']} hits, {stats['live_calls']} live calls this run, "
        f"{stats['fetch_failures']} failures)"
    )


if __name__ == "__main__":
    main()
