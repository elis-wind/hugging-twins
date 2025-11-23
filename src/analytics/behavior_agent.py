from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

import pandas as pd


@dataclass
class Insight:
    title: str
    detail: str


def detect_patterns(signals: Dict[str, pd.DataFrame]) -> List[Insight]:
    """
    Lightweight longitudinal insights over daily/weekly slices.
    Feeds the GenAI layer for narrative generation.
    """
    insights: List[Insight] = []

    if "steps" in signals and "sleep" in signals:
        merged = pd.merge(
            signals["steps"].rename(columns={"value": "steps"}),
            signals["sleep"].rename(columns={"value": "sleep"}),
            on="timestamp",
            how="inner",
        )
        if not merged.empty:
            corr = merged["steps"].corr(merged["sleep"])
            if pd.notna(corr):
                insights.append(
                    Insight(
                        title="Activity ↔ Sleep",
                        detail=f"Steps vs sleep hours correlation: {corr:.2f}",
                    )
                )

    if "sleep" in signals:
        sleep = signals["sleep"].copy()
        if not sleep.empty:
            sleep["dow"] = pd.to_datetime(sleep["timestamp"]).dt.day_name()
            by_dow = sleep.groupby("dow")["value"].mean().sort_values()
            worst = by_dow.index[0]
            best = by_dow.index[-1]
            insights.append(
                Insight(
                    title="Sleep regularity",
                    detail=f"Lowest average sleep on {worst}, highest on {best}.",
                )
            )

    return insights
