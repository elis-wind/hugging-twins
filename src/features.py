from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional

import numpy as np
import pandas as pd


@dataclass
class FeatureSet:
    features: Dict[str, float]
    derived_series: Dict[str, pd.DataFrame]


def rolling_baseline(df: pd.DataFrame, window: int, col: str = "value") -> pd.Series:
    return df[col].rolling(window, min_periods=max(3, window // 2)).mean()


def compute_features(signals: Dict[str, pd.DataFrame]) -> FeatureSet:
    feats: Dict[str, float] = {}
    series: Dict[str, pd.DataFrame] = {}

    # HRV
    if "hrv_hourly" in signals:
        hrv = signals["hrv_hourly"].copy()
        hrv["baseline_24h"] = rolling_baseline(hrv, 24)
        hrv["delta_pct"] = (hrv["value"] - hrv["baseline_24h"]) / hrv["baseline_24h"] * 100
        series["hrv"] = hrv
        feats["hrv_baseline_mean"] = float(hrv["baseline_24h"].mean())
        feats["hrv_drop_pct"] = float(hrv["delta_pct"].quantile(0.1)) if not hrv.empty else 0.0

    # Resting HR
    if "rhr_hourly" in signals:
        rhr = signals["rhr_hourly"].copy()
        rhr["baseline_24h"] = rolling_baseline(rhr, 24)
        rhr["delta"] = rhr["value"] - rhr["baseline_24h"]
        series["rhr"] = rhr
        feats["rhr_mean"] = float(rhr["value"].mean())
        feats["rhr_elevated"] = float(rhr["delta"].quantile(0.9)) if not rhr.empty else 0.0

    # Sleep
    if "sleep_nightly" in signals:
        sleep = signals["sleep_nightly"].copy()
        sleep["baseline_7d"] = rolling_baseline(sleep, 7)
        sleep["deficit"] = sleep["baseline_7d"] - sleep["value"]
        series["sleep"] = sleep
        feats["sleep_avg"] = float(sleep["value"].mean())
        feats["sleep_deficit"] = float(max(0.0, sleep["deficit"].mean()))
        feats["sleep_regular"] = float(sleep["value"].std())

    # Respiration
    if "respiration_hourly" in signals:
        resp = signals["respiration_hourly"].copy()
        series["respiration"] = resp
        feats["resp_rate_mean"] = float(resp["value"].mean())

    # Steps / activity
    if "steps_daily" in signals:
        steps = signals["steps_daily"].copy()
        series["steps"] = steps
        feats["steps_mean"] = float(steps["value"].mean())
        feats["steps_std"] = float(steps["value"].std())

    # Derived stress index proxy
    feats["stress_index_proxy"] = float(
        0.4 * (100 - feats.get("hrv_baseline_mean", 0))
        + 0.3 * feats.get("rhr_elevated", 0)
        + 0.2 * feats.get("sleep_deficit", 0)
        + 0.1 * feats.get("steps_std", 0)
    )

    return FeatureSet(features=feats, derived_series=series)
