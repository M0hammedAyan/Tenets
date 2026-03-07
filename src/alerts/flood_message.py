"""Standalone script for running the traditional flood risk model
and sending a Telegram evacuation alert when the result is high.

This module is located inside `src/alerts` and is intended as a simple
command‑line utility.  It reuses the existing `telegram_alert` service
and the pickled model stored in the top‑level `models` directory.
"""

import os
import sys
from pathlib import Path
import pickle
import numpy as np

# allow imports from project root or src package regardless of how script is invoked
project_root = Path(__file__).parent.parent.parent
src_root = project_root / "src"
for p in (project_root, src_root):
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))

from src.alerts.telegram_alert import alert_high_risk

# by default look for the traditional model in the top-level models folder
MODEL_PATH = Path(os.getenv('FMS_MODEL_PATH',
                   Path(__file__).parent.parent.parent / "models" / "flood_model.pkl"))


def load_model():
    """Load the traditional flood model, raising informative errors.

    The model file must exist and be non-empty; an empty file usually means the
    training step hasn't been run or failed.  This function wraps pickle.load to
    give a clearer message on failure.
    """
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}\n" \
            "Please train the model (e.g. via `python src/models/train_model.py`)"
        )
    size = MODEL_PATH.stat().st_size
    if size == 0:
        raise RuntimeError(
            f"Model file {MODEL_PATH} is empty ({size} bytes). "
            "Run the training pipeline to populate it."
        )
    try:
        # first try pickle (legacy)
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    except Exception as e_pickle:
        # if that fails, sklearn objects are often saved with joblib
        try:
            import joblib
            return joblib.load(MODEL_PATH)
        except Exception as e_joblib:
            raise RuntimeError(
                f"Failed to load model from {MODEL_PATH}: pickle error {e_pickle}; "
                f"joblib error {e_joblib}"
            )


def predict_risk(model, features):
    score = model.predict_proba([features])[0][1]
    if score < 0.33:
        level = "Low"
    elif score < 0.66:
        level = "Medium"
    else:
        level = "High"
    return level, score


def main():
    """Usage: flood_message.py r3 r24 soil elev slope river [latitude longitude]

    Coordinates are optional; if provided the alert will include a nearby safe
    location (offset by ~0.05 degrees)."""
    if len(sys.argv) < 7:
        print(main.__doc__)
        sys.exit(1)

    vals = list(map(float, sys.argv[1:7]))
    lat = float(sys.argv[7]) if len(sys.argv) >= 8 else None
    lon = float(sys.argv[8]) if len(sys.argv) >= 9 else None

    model = load_model()
    level, score = predict_risk(model, vals)
    print(f"Risk level: {level}, score: {score:.2f}")

    if level == "High":
        if lat is not None and lon is not None:
            safe_lat = lat + 0.05
            safe_lon = lon + 0.05
            alert_high_risk(extra_text=f"Risk score: {score:.2f}",
                            safe_lat=safe_lat, safe_lon=safe_lon)
        else:
            alert_high_risk(extra_text=f"Risk score: {score:.2f}")
    else:
        print("No alert sent (risk not high)")


if __name__ == "__main__":
    main()