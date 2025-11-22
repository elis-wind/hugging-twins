import csv
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd


DATA_DIR = Path("data")
SUMMARY_PATH = DATA_DIR / "health_summary.json"


def load_samsung_csv(path: Path) -> pd.DataFrame:
    """
    Samsung exports start with a metadata row, then a header row whose length
    occasionally differs from the data rows. This loader trims/pads rows so the
    dataframe keeps column alignment and uses UTF-8 with BOM handling.
    """
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.reader(handle)
        next(reader, None)  # metadata row
        header = next(reader, [])
        rows: List[List[str]] = []
        for row in reader:
            if len(row) > len(header):
                row = row[: len(header)]
            elif len(row) < len(header):
                row = row + [""] * (len(header) - len(row))
            rows.append(row)
    return pd.DataFrame(rows, columns=header)


def to_datetime(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, errors="coerce")


def to_numeric(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce")


def calc_trend(dates: pd.Series, values: pd.Series) -> float:
    """Return slope per day using simple linear regression. 0 if insufficient data."""
    valid = (~dates.isna()) & (~values.isna())
    dates = dates[valid]
    values = values[valid]
    if len(values) < 3:
        return 0.0
    ordinal = dates.map(datetime.toordinal)
    x = ordinal - ordinal.min()
    slope, _ = np.polyfit(x, values, 1)
    return float(slope)


def serialize_series(df: pd.DataFrame, value_col: str, alias: Optional[str] = None) -> List[Dict]:
    name = alias or value_col
    records: List[Dict] = []
    for _, row in df.iterrows():
        val = row[value_col]
        records.append({"date": str(row["date"]), name: float(val) if pd.notna(val) else None})
    return records


def aggregate_steps() -> Tuple[pd.DataFrame, Dict[str, float]]:
    df = load_samsung_csv(DATA_DIR / "com.samsung.shealth.tracker.pedometer_step_count.20251122092438.csv")
    df["timestamp"] = to_datetime(df["com.samsung.health.step_count.start_time"])
    df["steps"] = to_numeric(df["com.samsung.health.step_count.count"])
    daily = (
        df.dropna(subset=["timestamp", "steps"])
        .assign(date=lambda d: d["timestamp"].dt.date)
        .groupby("date")["steps"]
        .sum()
        .reset_index()
        .sort_values("date")
    )
    stats = {
        "average": float(daily["steps"].mean()) if len(daily) else 0.0,
        "trend_per_day": calc_trend(pd.to_datetime(daily["date"]), daily["steps"]),
        "recent_average": float(daily.tail(30)["steps"].mean()) if len(daily) else 0.0,
    }
    return daily, stats


def aggregate_resting_hr() -> Tuple[pd.DataFrame, Dict[str, float]]:
    df = load_samsung_csv(DATA_DIR / "com.samsung.shealth.tracker.heart_rate.20251122092438.csv")
    df["timestamp"] = to_datetime(df["com.samsung.health.heart_rate.start_time"])
    df["bpm"] = to_numeric(df["com.samsung.health.heart_rate.heart_rate"])
    per_day = (
        df.dropna(subset=["timestamp", "bpm"])
        .assign(date=lambda d: d["timestamp"].dt.date)
        .groupby("date")["bpm"]
        .min()
        .reset_index()
        .sort_values("date")
    )
    stats = {
        "average": float(per_day["bpm"].mean()) if len(per_day) else 0.0,
        "trend_per_day": calc_trend(pd.to_datetime(per_day["date"]), per_day["bpm"]),
    }
    return per_day, stats


def aggregate_sleep() -> Tuple[pd.DataFrame, Dict[str, float]]:
    df = load_samsung_csv(DATA_DIR / "com.samsung.shealth.sleep_combined.20251122092438.csv")
    df["start_time"] = to_datetime(df["start_time"])
    df["sleep_duration"] = to_numeric(df["sleep_duration"])  # minutes
    per_night = (
        df.dropna(subset=["start_time", "sleep_duration"])
        .assign(date=lambda d: d["start_time"].dt.date, hours=lambda d: d["sleep_duration"] / 60.0)
        .groupby("date")["hours"]
        .sum()
        .reset_index()
        .sort_values("date")
    )
    stats = {
        "average": float(per_night["hours"].mean()) if len(per_night) else 0.0,
        "trend_per_day": calc_trend(pd.to_datetime(per_night["date"]), per_night["hours"]),
    }
    return per_night, stats


def aggregate_stress() -> Tuple[pd.DataFrame, Dict[str, float]]:
    df = load_samsung_csv(DATA_DIR / "com.samsung.shealth.stress.20251122092438.csv")
    df["start_time"] = to_datetime(df["start_time"])
    df["score"] = to_numeric(df["score"])
    per_day = (
        df.dropna(subset=["start_time", "score"])
        .assign(date=lambda d: d["start_time"].dt.date)
        .groupby("date")["score"]
        .mean()
        .reset_index()
        .sort_values("date")
    )
    stats = {
        "average": float(per_day["score"].mean()) if len(per_day) else 0.0,
        "trend_per_day": calc_trend(pd.to_datetime(per_day["date"]), per_day["score"]),
    }
    return per_day, stats


def aggregate_weight() -> Tuple[pd.DataFrame, Dict[str, float]]:
    df = load_samsung_csv(DATA_DIR / "com.samsung.health.weight.20251122092438.csv")
    df["start_time"] = to_datetime(df["start_time"])
    df["weight"] = to_numeric(df["weight"])
    readings = (
        df.dropna(subset=["start_time", "weight"])
        .assign(date=lambda d: d["start_time"].dt.date)
        .groupby("date")["weight"]
        .mean()
        .reset_index()
        .sort_values("date")
    )
    stats = {
        "average": float(readings["weight"].mean()) if len(readings) else 0.0,
        "trend_per_day": calc_trend(pd.to_datetime(readings["date"]), readings["weight"]),
        "latest": float(readings["weight"].iloc[-1]) if len(readings) else 0.0,
    }
    return readings, stats


def build_summary() -> Dict:
    steps, steps_stats = aggregate_steps()
    hr, hr_stats = aggregate_resting_hr()
    sleep, sleep_stats = aggregate_sleep()
    stress, stress_stats = aggregate_stress()
    weight, weight_stats = aggregate_weight()

    summary = {
        "generated_at": datetime.now().isoformat(),
        "series": {
            "steps": serialize_series(steps.tail(120), "steps"),
            "resting_hr": serialize_series(hr.tail(120), "bpm"),
            "sleep": serialize_series(sleep.tail(120), "hours"),
            "stress": serialize_series(stress.tail(120), "score"),
            "weight": serialize_series(weight.tail(120), "weight"),
        },
        "metrics": {
            "steps": steps_stats,
            "resting_hr": hr_stats,
            "sleep": sleep_stats,
            "stress": stress_stats,
            "weight": weight_stats,
        },
    }
    return summary


def main() -> None:
    summary = build_summary()
    SUMMARY_PATH.parent.mkdir(parents=True, exist_ok=True)
    SUMMARY_PATH.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"Wrote {SUMMARY_PATH} with {len(summary['series']['steps'])} step days.")


if __name__ == "__main__":
    main()
