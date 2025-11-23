from __future__ import annotations

from typing import Dict, Optional

import numpy as np
import pandas as pd
from pandas.api.types import is_datetime64_any_dtype

from .data_loader import SignalFrames


def _to_datetime(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, errors="coerce")


def _to_numeric(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce")


def resample_signal(df: pd.DataFrame, time_col: str, value_col: str, rule: str) -> pd.DataFrame:
    """Generic resampler with mean aggregation and forward-fill for short gaps."""
    df = df.copy()
    df[time_col] = _to_datetime(df[time_col])
    df[value_col] = _to_numeric(df[value_col])
    df = df.dropna(subset=[time_col, value_col])
    if df.empty:
        return df
    out = df.set_index(time_col).resample(rule.lower())[value_col].mean().ffill(limit=2)
    return out.reset_index().rename(columns={value_col: "value", time_col: "timestamp"})


def harmonize(frames: SignalFrames) -> Dict[str, pd.DataFrame]:
    """
    Build a dictionary of harmonized signals (hourly/daily) with consistent columns:
    - timestamp
    - value
    """
    signals: Dict[str, pd.DataFrame] = {}

    if frames.hrv is not None:
        cand_cols = [c for c in frames.hrv.columns if "start_time" in c]
        time_col = cand_cols[0] if cand_cols else None
        sdnn_col = next((c for c in frames.hrv.columns if "sdnn" in c.lower()), None)
        if time_col and sdnn_col:
            signals["hrv_hourly"] = resample_signal(frames.hrv, time_col, sdnn_col, "1h")

    if frames.heart_rate is not None:
        time_col = next((c for c in frames.heart_rate.columns if c.endswith(".start_time")), None)
        hr_col = next((c for c in frames.heart_rate.columns if c.endswith(".heart_rate")), None)
        if time_col and hr_col:
            signals["rhr_hourly"] = resample_signal(frames.heart_rate, time_col, hr_col, "1h")

    if frames.sleep is not None:
        time_col = "start_time" if "start_time" in frames.sleep.columns else None
        dur_col = "sleep_duration" if "sleep_duration" in frames.sleep.columns else None
        if time_col and dur_col:
            df = frames.sleep.copy()
            df[time_col] = _to_datetime(df[time_col])
            df[dur_col] = _to_numeric(df[dur_col]) / 60.0
            if not is_datetime64_any_dtype(df[time_col]):
                df[time_col] = pd.to_datetime(df[time_col], errors="coerce")
            df = df.dropna(subset=[time_col, dur_col])
            if not df.empty:
                nightly = (
                    df.assign(date=df[time_col].dt.date)
                    .groupby("date")[dur_col]
                    .sum()
                    .reset_index()
                    .rename(columns={"date": "timestamp", dur_col: "value"})
                )
                signals["sleep_nightly"] = nightly

    if frames.respiration is not None:
        time_col = next((c for c in frames.respiration.columns if "start_time" in c), None)
        resp_col = next((c for c in frames.respiration.columns if "respiratory_rate" in c), None)
        if time_col and resp_col:
            signals["respiration_hourly"] = resample_signal(frames.respiration, time_col, resp_col, "1h")

    if frames.steps is not None:
        time_col = next((c for c in frames.steps.columns if "start_time" in c), None)
        steps_col = next((c for c in frames.steps.columns if "count" in c and "step_count" in c), None)
        if time_col and steps_col:
            df = frames.steps.copy()
            df[time_col] = _to_datetime(df[time_col])
            df[steps_col] = _to_numeric(df[steps_col])
            df = df.dropna(subset=[time_col, steps_col])
            if not df.empty and is_datetime64_any_dtype(df[time_col]):
                daily = (
                    df.assign(date=df[time_col].dt.date)
                    .groupby("date")[steps_col]
                    .sum()
                    .reset_index()
                    .rename(columns={"date": "timestamp", steps_col: "value"})
                )
                signals["steps_daily"] = daily

    return signals
