from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Optional

import pandas as pd


DATA_DIR = Path("data")


def _load_samsung_csv(path: Path) -> pd.DataFrame:
    """Load Samsung Health export with metadata row and uneven row lengths."""
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.reader(handle)
        next(reader, None)  # metadata row
        header = next(reader, [])
        rows = []
        for row in reader:
            if len(row) > len(header):
                row = row[: len(header)]
            elif len(row) < len(header):
                row = row + [""] * (len(header) - len(row))
            rows.append(row)
    return pd.DataFrame(rows, columns=header)


def _load_apple_csv(path: Path) -> pd.DataFrame:
    """
    Apple Health exports are usually clean CSVs; keep a hook for symmetry with Samsung.
    Adjust parsing here if your Apple exports come in XML/JSON instead.
    """
    return pd.read_csv(path, encoding="utf-8-sig")


@dataclass
class SignalFrames:
    hrv: Optional[pd.DataFrame] = None
    heart_rate: Optional[pd.DataFrame] = None
    sleep: Optional[pd.DataFrame] = None
    respiration: Optional[pd.DataFrame] = None
    steps: Optional[pd.DataFrame] = None
    workouts: Optional[pd.DataFrame] = None
    menstrual: Optional[pd.DataFrame] = None


class DataLoader:
    """
    Harmonized entrypoint for Apple Health or Samsung Health exports.
    You can point to specific files or drop the CSVs into ./data/.
    """

    def __init__(self, root: Path = DATA_DIR):
        self.root = root

    def load_samsung(self) -> SignalFrames:
        return SignalFrames(
            hrv=self._maybe_load("com.samsung.health.hrv.20251122092438.csv"),
            heart_rate=self._maybe_load("com.samsung.shealth.tracker.heart_rate.20251122092438.csv"),
            sleep=self._maybe_load("com.samsung.shealth.sleep_combined.20251122092438.csv"),
            respiration=self._maybe_load("com.samsung.health.respiratory_rate.20251122092438.csv"),
            steps=self._maybe_load("com.samsung.shealth.tracker.pedometer_step_count.20251122092438.csv"),
            workouts=self._maybe_load("com.samsung.shealth.exercise.20251122092438.csv"),
        )

    def load_apple(self) -> SignalFrames:
        # Placeholder hooks; adjust names to your Apple export files if present.
        return SignalFrames(
            hrv=self._maybe_load("apple_health_hrv.csv", kind="apple"),
            heart_rate=self._maybe_load("apple_health_heart_rate.csv", kind="apple"),
            sleep=self._maybe_load("apple_health_sleep.csv", kind="apple"),
            respiration=self._maybe_load("apple_health_respiration.csv", kind="apple"),
            steps=self._maybe_load("apple_health_steps.csv", kind="apple"),
            workouts=self._maybe_load("apple_health_workouts.csv", kind="apple"),
            menstrual=self._maybe_load("apple_health_menstrual.csv", kind="apple"),
        )

    def _maybe_load(self, filename: str, kind: str = "samsung") -> Optional[pd.DataFrame]:
        path = self.root / filename
        if not path.exists():
            return None
        loader = _load_samsung_csv if kind == "samsung" else _load_apple_csv
        df = loader(path)
        df.attrs["source"] = kind
        df.attrs["filename"] = filename
        return df


def load_all(source: str = "samsung", root: Path = DATA_DIR) -> SignalFrames:
    loader = DataLoader(root)
    return loader.load_samsung() if source == "samsung" else loader.load_apple()
