from __future__ import annotations

import json
from pathlib import Path

from src.data_loader import load_all
from src.harmonization import harmonize
from src.features import compute_features
from src.behavior_agent import detect_patterns
from src.stress_engine import StressEngine


def run_pipeline(source: str = "samsung", data_dir: Path = Path("data")) -> dict:
    frames = load_all(source=source, root=data_dir)
    signals = harmonize(frames)
    feature_set = compute_features(signals)
    engine = StressEngine()
    stress = engine.classify(feature_set.features)
    patterns = detect_patterns(feature_set.derived_series)

    result = {
        "stress": {
            "label": stress.label,
            "confidence": stress.confidence,
            "scores": stress.scores,
            "explanation": stress.explanation,
        },
        "features": feature_set.features,
        "behavioral_insights": [p.__dict__ for p in patterns],
    }
    return result


def main():
    result = run_pipeline()
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
