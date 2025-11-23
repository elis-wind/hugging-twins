from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple

from .genai import generate_explanation


STRESS_CLASSES = [
    "physiological",
    "cognitive_mental",
    "recovery_deficit",
    "circadian_disruption",
    "lifestyle_driven",
]


@dataclass
class StressResult:
    label: str
    confidence: float
    scores: Dict[str, float]
    explanation: str


class StressEngine:
    """
    Rule-based stress classifier + GenAI explanation.
    """

    def __init__(self):
        pass

    def classify(self, features: Dict[str, float]) -> StressResult:
        scores = self._rule_inference(features)
        label, conf = self._argmax(scores)
        explain_features = {k: v for k, v in features.items() if k != "stress_index_proxy"}
        explanation = generate_explanation(label, conf, explain_features)
        return StressResult(label=label, confidence=conf, scores=scores, explanation=explanation)

    def _rule_inference(self, f: Dict[str, float]) -> Dict[str, float]:
        scores = {k: 0.0 for k in STRESS_CLASSES}
        hrv_drop = abs(f.get("hrv_drop_pct", 0))
        rhr_elev = f.get("rhr_elevated", 0)
        sleep_def = f.get("sleep_deficit", 0)
        sleep_reg = f.get("sleep_regular", 0)
        steps_std = f.get("steps_std", 0)

        # Physiological: HRV crash + RHR elevated
        scores["physiological"] += (hrv_drop > 5) * 0.5 + (rhr_elev > 3) * 0.5
        # Recovery deficit: sleep deficit + HRV drop
        scores["recovery_deficit"] += (sleep_def > 0.5) * 0.6 + (hrv_drop > 5) * 0.4
        # Circadian: high sleep irregularity
        scores["circadian_disruption"] += (sleep_reg > 0.7) * 0.8
        # Lifestyle: erratic steps / activity volatility
        scores["lifestyle_driven"] += (steps_std > 4000) * 0.6
        # Cognitive/mental: if physiological is low but stress proxy is high
        proxy = f.get("stress_index_proxy", 0)
        scores["cognitive_mental"] += (proxy > 30 and scores["physiological"] < 0.3) * 0.7

        return self._normalize(scores)

    @staticmethod
    def _normalize(scores: Dict[str, float]) -> Dict[str, float]:
        total = sum(scores.values())
        if total == 0:
            return {k: 1 / len(scores) for k in scores}
        return {k: v / total for k, v in scores.items()}

    @staticmethod
    def _argmax(scores: Dict[str, float]) -> Tuple[str, float]:
        label = max(scores, key=scores.get)
        return label, float(scores[label])
