#!/usr/bin/env python3
"""
enrich_covariates.py — BROADN build-time weather-covariate enrichment (Phase 1).

Attaches concurrent MIxS-Air weather covariates (temp, humidity, wind_speed,
wind_direction, barometric_press, precipitation) to each Field Sample row by
querying the Open-Meteo historical archive API, keyed on each sample's
collection coordinate + date. Output is a committed, reproducible side-file:
`data/covariates.json` (+ a committed response cache `data/cache/
covariates-cache.json`). The static site itself is untouched — this is
build-time metadata, not part of the reference-only results surface.

Standalone reader (intentional duplication of preprocess_data.load_xlsx() and
its column literals, NOT a DRY violation): a separate reader decouples this
build-time enrichment step from scripts/preprocess_data.py so a change to one
pipeline can never silently break the other; see load_field_samples() below.

FOUR TIME-FIDELITY TIERS (evaluated in this fixed, mutually-exclusive order):
  1. no_date       — no valid Sample Collected Date -> cannot query at all.
  2. exact         — valid date + parseable exact Sample Collected Time.
  3. ampm_imputed  — valid date + Sample AM/PM only -> impute AM=09:00/PM=15:00.
  4. date_only     — valid date, no time, no AM/PM -> daily aggregate only.
A timed-but-undated row is bucketed "no_date", never "exact" (order matters).

UNIT CONVERSION happens EXACTLY ONCE per unique (lat,lon,date) key, on the raw
hourly arrays immediately after they are obtained (live fetch OR cache hit),
strictly BEFORE both hourly point-extraction and daily aggregation:
  wind_speed_10m (km/h)   -> wind_speed (m/s),        divide by 3.6
  surface_pressure (hPa)  -> barometric_press (kPa),  divide by 10
temperature_2m, relative_humidity_2m, wind_direction_10m, precipitation are
already in the target MIxS-Air units and pass through unchanged.

DEDUP + CACHE: samples are grouped by (round(lat, 2), round(lon, 2), date) —
2 decimal places (~1 km) is fine-grained enough to keep distinct BROADN sites
separate while still collapsing repeat visits/dates at the same site onto one
Open-Meteo call. The ROUNDED coords are what gets queried (deterministic cache
key); `offset_km` (haversine, sample's TRUE coord -> the resolved grid cell)
is still computed PER SAMPLE. Every unique key's raw response is cached in a
single committed file (data/cache/covariates-cache.json) so a second run is
100% offline (zero network calls).
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
COL_SAMPLE_AMPM = "Sample AM/PM"
COL_LATITUDE = "Latitude"
COL_LONGITUDE = "Longitude"
FIELD_SAMPLE_CATEGORY = "Field Sample"

# ── Open-Meteo contract (live-verified 2026-07-06) ──────────────────────────
API_BASE_URL = "https://archive-api.open-meteo.com/v1/archive"
HOURLY_VARS = (
    "temperature_2m,relative_humidity_2m,precipitation,"
    "wind_speed_10m,wind_direction_10m,surface_pressure"
)
USER_AGENT = (
    "BROADN-WebView-CovariateEnrichment/1.0 "
    "(+https://github.com/jh-bertram/broadn-web-view; build-time static-site enrichment)"
)

# ── Tunable constants ────────────────────────────────────────────────────────
DEDUP_PRECISION = 2   # round(lat/lon, 2) ~= 1.1 km grid; fine enough to keep sites distinct
FLOAT_PRECISION = 4    # fixed decimal places for deterministic serialization
AMPM_IMPUTE_HOURS = {"AM": 9, "PM": 15}
THROTTLE_SECONDS = 0.3
MAX_RETRIES = 4
BACKOFF_BASE_SECONDS = 1.0

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


# ── Time-fidelity classification ────────────────────────────────────────────
def parse_exact_time(val: object) -> tuple[int, int] | None:
    """Parse a datetime.time object or 'HH:MM' string into (hour, minute).

    Mirrors the parsing shape of preprocess_data._time_to_hour() (L719) but
    also keeps the minute component, needed here for nearest-hour matching.
    Returns None if null/unparseable.
    """
    if pd.isna(val):
        return None
    if hasattr(val, "hour"):
        return val.hour, getattr(val, "minute", 0)
    try:
        parts = str(val).split(":")
        return int(parts[0]), int(parts[1]) if len(parts) > 1 else 0
    except (ValueError, IndexError):
        return None


def classify_time_fidelity(
    date_val: object, time_val: object, ampm_val: object
) -> tuple[str, bool, tuple[int, int] | None]:
    """Return (time_fidelity, time_imputed, (hour, minute)|None).

    Fixed, mutually-exclusive precedence: no_date -> exact -> ampm_imputed ->
    date_only. A timed-but-undated row is "no_date", never "exact".
    """
    if pd.isna(date_val):
        return "no_date", True, None
    exact = parse_exact_time(time_val)
    if exact is not None:
        return "exact", False, exact
    if pd.notna(ampm_val) and str(ampm_val).strip().upper() in AMPM_IMPUTE_HOURS:
        hour = AMPM_IMPUTE_HOURS[str(ampm_val).strip().upper()]
        return "ampm_imputed", True, (hour, 0)
    return "date_only", True, None


def is_bad_coord(lat: object, lon: object) -> bool:
    """Longitude > 0 (sign-flipped 'Doane' rows) or null lat/lon -> bad coord.
    Phase 1 skips + flags only; no sign-correction (PI decision, out of scope).
    """
    if pd.isna(lat) or pd.isna(lon):
        return True
    return float(lon) > 0


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
    Required for wind_direction daily aggregation — an arithmetic mean of
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
def make_cache_key(lat_r: float, lon_r: float, date_iso: str) -> str:
    return f"{lat_r:.2f}_{lon_r:.2f}_{date_iso}"


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


def fetch_open_meteo_live(lat_r: float, lon_r: float, date_iso: str) -> dict | None:
    """Single live Open-Meteo archive request with polite throttling and
    exponential backoff on HTTP 429/5xx. Never raises — returns None on
    unrecoverable failure so the caller can mark fetch_status='failed' and
    the build continues (never aborts on one bad fetch)."""
    params = {
        "latitude": lat_r,
        "longitude": lon_r,
        "start_date": date_iso,
        "end_date": date_iso,
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
                f"({lat_r},{lon_r},{date_iso}) — giving up after {attempt + 1} attempt(s)",
                file=sys.stderr,
            )
            return None
        except requests.RequestException as exc:
            if attempt < MAX_RETRIES:
                time.sleep(delay)
                delay *= 2
                continue
            print(
                f"  WARNING: Open-Meteo request error for ({lat_r},{lon_r},{date_iso}): {exc}",
                file=sys.stderr,
            )
            return None
    return None


def get_or_fetch_key(lat_r: float, lon_r: float, date_iso: str, cache: dict, stats: dict) -> dict | None:
    """Cache-or-live-fetch a single (lat_r, lon_r, date_iso) key. Persists ONLY
    deterministic fields: RAW hourly arrays + time[] + resolved
    lat/lon/elevation/timezone/utc_offset. `generationtime_ms` is deliberately
    dropped (nondeterministic, would break offline byte-identity)."""
    key = make_cache_key(lat_r, lon_r, date_iso)
    if key in cache:
        stats["cache_hits"] += 1
        return cache[key]
    raw = fetch_open_meteo_live(lat_r, lon_r, date_iso)
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


# ── Local-time matching + extraction/aggregation ────────────────────────────
def nearest_hour_index(local_times: list[str], hour: int, minute: int) -> int:
    """Index into `local_times` (ISO 'YYYY-MM-DDTHH:MM', all the same local
    calendar day) nearest to hour:minute local time."""
    target = hour * 60 + minute
    best_idx, best_diff = 0, None
    for i, t in enumerate(local_times):
        hh, mm = t.split("T")[1].split(":")
        diff = abs(int(hh) * 60 + int(mm) - target)
        if best_diff is None or diff < best_diff:
            best_idx, best_diff = i, diff
    return best_idx


def utc_time_from_local(local_time_str: str, utc_offset_seconds: int) -> str:
    local_dt = datetime.strptime(local_time_str, "%Y-%m-%dT%H:%M")
    utc_dt = local_dt - timedelta(seconds=utc_offset_seconds)
    return utc_dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def extract_scalar_covariates(converted_hourly: dict, idx: int) -> dict:
    """MIxS-Air scalar point-reading at hourly index `idx`."""
    return {
        "temp": converted_hourly["temperature_2m"][idx],
        "humidity": converted_hourly["relative_humidity_2m"][idx],
        "wind_speed": converted_hourly["wind_speed_10m"][idx],
        "wind_direction": converted_hourly["wind_direction_10m"][idx],
        "barometric_press": converted_hourly["surface_pressure"][idx],
        "precipitation": converted_hourly["precipitation"][idx],
    }


def aggregate_daily_covariates(converted_hourly: dict) -> dict:
    """Per-variable-correct daily aggregation over a day's converted hourly
    arrays: precipitation SUMS (hourly values are preceding-hour
    accumulations); wind_direction uses a CIRCULAR mean; temp/humidity/
    wind_speed/barometric_press use an arithmetic mean; temp also gets
    daily min + max."""

    def clean(vals: list) -> list:
        return [v for v in vals if v is not None]

    temps = clean(converted_hourly["temperature_2m"])
    hums = clean(converted_hourly["relative_humidity_2m"])
    winds = clean(converted_hourly["wind_speed_10m"])
    dirs = clean(converted_hourly["wind_direction_10m"])
    press = clean(converted_hourly["surface_pressure"])
    precip = clean(converted_hourly["precipitation"])
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
def _null_record(tier: str, imputed: bool, coord_status: str, fetch_status: str) -> dict:
    """Shared null-provenance shape for no_date / skipped_bad_coord / failed
    samples (DRY — avoids repeating the same null skeleton three times)."""
    return {
        "covariates": None,
        "covariates_daily": None,
        "provenance": {
            "covariate_source": None,
            "resolved_grid_lat": None,
            "resolved_grid_lon": None,
            "elevation": None,
            "offset_km": None,
            "matched_local_time": None,
            "matched_utc_time": None,
            "timezone": None,
            "utc_offset_seconds": None,
            "time_fidelity": tier,
            "time_imputed": imputed,
            "coord_status": coord_status,
            "fetch_status": fetch_status,
        },
    }


def build_sample_record(m: dict, key_data: dict, key_daily: dict, key_raw: dict) -> dict:
    """Build one sample's {covariates, covariates_daily, provenance} record
    from its classification + the shared per-key fetch results."""
    tier, imputed, hm, bad_coord, key = m["tier"], m["imputed"], m["hm"], m["bad_coord"], m["key"]
    coord_status = "skipped_bad_coord" if bad_coord else "ok"

    if tier == "no_date":
        return _null_record(tier, imputed, coord_status, fetch_status="no_date")
    if bad_coord:
        return _null_record(tier, imputed, coord_status, fetch_status="skipped_bad_coord")

    converted = key_data.get(key)
    if converted is None:
        return _null_record(tier, imputed, coord_status, fetch_status="failed")

    raw_entry = key_raw[key]
    daily = key_daily[key]
    offset_km = haversine_km(m["lat"], m["lon"], raw_entry["resolved_latitude"], raw_entry["resolved_longitude"])

    scalar, matched_local, matched_utc = None, None, None
    if tier in ("exact", "ampm_imputed"):
        hour, minute = hm
        idx = nearest_hour_index(raw_entry["hourly"]["time"], hour, minute)
        scalar = extract_scalar_covariates(converted, idx)
        matched_local = raw_entry["hourly"]["time"][idx]
        matched_utc = utc_time_from_local(matched_local, raw_entry["utc_offset_seconds"])

    provenance = {
        "covariate_source": "open-meteo-archive",
        "resolved_grid_lat": raw_entry["resolved_latitude"],
        "resolved_grid_lon": raw_entry["resolved_longitude"],
        "elevation": raw_entry["elevation"],
        "offset_km": offset_km,
        "matched_local_time": matched_local,
        "matched_utc_time": matched_utc,
        "timezone": raw_entry["timezone"],
        "utc_offset_seconds": raw_entry["utc_offset_seconds"],
        "time_fidelity": tier,
        "time_imputed": imputed,
        "coord_status": coord_status,
        "fetch_status": "success",
    }
    return {"covariates": scalar, "covariates_daily": daily, "provenance": provenance}


# ── Pre-bulk timezone/diurnal spot-check ────────────────────────────────────
def run_spot_check(row_meta: dict, cache: dict, stats: dict) -> None:
    """Sanity-check local-time indexing BEFORE the bulk run: pick one
    exact-time afternoon sample and one exact-time pre-dawn sample, fetch
    their day, and print whether the afternoon reading sits nearer the day's
    temp max and the pre-dawn reading nearer the day's temp min (per the
    RESOLVED timezone=auto offset). A printed sanity check, not an assertion
    — any single day/site can legitimately buck the average trend."""
    afternoon, predawn = None, None
    for broadn_id, m in sorted(row_meta.items()):
        if m["tier"] != "exact" or m["bad_coord"] or m["key"] is None:
            continue
        hour = m["hm"][0]
        if afternoon is None and 12 <= hour <= 16:
            afternoon = (broadn_id, m)
        elif predawn is None and 1 <= hour <= 5:
            predawn = (broadn_id, m)
        if afternoon and predawn:
            break

    print("\n=== PRE-BULK TIMEZONE/DIURNAL SPOT-CHECK ===")
    for label, picked in (("afternoon", afternoon), ("pre-dawn", predawn)):
        if picked is None:
            print(f"  {label}: no eligible exact-time sample found; skipped")
            continue
        broadn_id, m = picked
        lat_r, lon_r, date_iso = m["key"]
        raw_entry = get_or_fetch_key(lat_r, lon_r, date_iso, cache, stats)
        if raw_entry is None:
            print(f"  {label} ({broadn_id}): fetch failed, cannot spot-check")
            continue
        converted = convert_hourly_units(raw_entry["hourly"])
        daily = aggregate_daily_covariates(converted)
        hour, minute = m["hm"]
        idx = nearest_hour_index(raw_entry["hourly"]["time"], hour, minute)
        matched_local = raw_entry["hourly"]["time"][idx]
        temp = converted["temperature_2m"][idx]
        nearer = "max" if abs(temp - daily["temp_max"]) <= abs(temp - daily["temp_min"]) else "min"
        print(
            f"  {label} ({broadn_id}) local={matched_local} tz={raw_entry['timezone']} "
            f"temp={temp:.2f}C day[min={daily['temp_min']:.2f} max={daily['temp_max']:.2f}] "
            f"nearer_to={nearer}"
        )
    print("=== END SPOT-CHECK ===\n")


# ── main ─────────────────────────────────────────────────────────────────────
def build_row_meta(df: pd.DataFrame) -> dict:
    """Classify every field-sample row independent of any network fetch."""
    row_meta = {}
    for _, row in df.iterrows():
        broadn_id = row[COL_BROADN_ID]
        date_val = row[COL_COLLECTED_DATE]
        lat, lon = row[COL_LATITUDE], row[COL_LONGITUDE]
        tier, imputed, hm = classify_time_fidelity(date_val, row[COL_COLLECTED_TIME], row[COL_SAMPLE_AMPM])
        bad_coord = is_bad_coord(lat, lon)
        key = None
        if tier != "no_date" and not bad_coord:
            date_iso = date_val.strftime("%Y-%m-%d")
            key = (round(float(lat), DEDUP_PRECISION), round(float(lon), DEDUP_PRECISION), date_iso)
        row_meta[broadn_id] = {
            "tier": tier,
            "imputed": imputed,
            "hm": hm,
            "bad_coord": bad_coord,
            "lat": float(lat) if pd.notna(lat) else None,
            "lon": float(lon) if pd.notna(lon) else None,
            "key": key,
        }
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
    print(f"Resolving {len(unique_keys)} unique (lat,lon,date) dedup keys...")
    key_data, key_daily, key_raw = {}, {}, {}
    for lat_r, lon_r, date_iso in unique_keys:
        key = (lat_r, lon_r, date_iso)
        raw_entry = get_or_fetch_key(lat_r, lon_r, date_iso, cache, stats)
        if raw_entry is None:
            key_data[key] = None
            continue
        converted = convert_hourly_units(raw_entry["hourly"])
        key_data[key] = converted
        key_raw[key] = raw_entry
        key_daily[key] = aggregate_daily_covariates(converted)

    samples = {}
    tier_counts = {"no_date": 0, "exact": 0, "ampm_imputed": 0, "date_only": 0}
    status_counts = {"no_date": 0, "skipped_bad_coord": 0, "success": 0, "failed": 0}
    for broadn_id, m in sorted(row_meta.items()):
        tier_counts[m["tier"]] += 1
        record = build_sample_record(m, key_data, key_daily, key_raw)
        status_counts[record["provenance"]["fetch_status"]] += 1
        samples[broadn_id] = record

    coverage_summary = {
        "total_field_samples": total,
        "by_time_fidelity": tier_counts,
        "by_fetch_status": status_counts,
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
            "precipitation_daily": "mm (sum over local day)",
        },
        "dedup_precision": DEDUP_PRECISION,
        "timezone_mode": "auto",
        "grid_note": (
            "Open-Meteo archive reanalysis is a modeled ~11-25km grid-cell estimate; "
            "sample metadata, not a measured result."
        ),
        "coverage_summary": coverage_summary,
    }
    output = round_floats({"meta": meta, "samples": samples}, FLOAT_PRECISION)

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
