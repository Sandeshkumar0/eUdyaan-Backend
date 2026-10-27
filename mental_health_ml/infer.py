#!/usr/bin/env python3
"""Single-shot or JSON-lines inference for the exported topic model."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import joblib

MODEL = Path(__file__).resolve().parent / "artifacts" / "support_topic_model.joblib"


def load_model():
    if not MODEL.exists():
        raise SystemExit("Model missing. Run generate_dataset.py and train.py first.")
    return joblib.load(MODEL)


def classify(model, text: str) -> dict:
    probabilities = model.predict_proba([text])[0]
    ranked = sorted(zip(model.classes_, probabilities), key=lambda item: item[1], reverse=True)
    return {
        "topic": ranked[0][0],
        "confidence": round(float(ranked[0][1]), 6),
        "alternatives": [
            {"topic": label, "confidence": round(float(score), 6)}
            for label, score in ranked[1:4]
        ],
        "model": "support-topic-logreg-v1",
    }


def serve(model) -> None:
    for line in sys.stdin:
        try:
            request = json.loads(line)
            result = classify(model, str(request.get("text", ""))[:10_000])
            result["id"] = request.get("id")
            print(json.dumps(result), flush=True)
        except Exception as error:  # keep worker alive and return a bounded error
            print(json.dumps({"id": request.get("id"), "error": str(error)[:300]}), flush=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("text", nargs="?")
    parser.add_argument("--serve", action="store_true")
    args = parser.parse_args()
    model = load_model()
    if args.serve:
        serve(model)
    elif args.text:
        print(json.dumps(classify(model, args.text), indent=2))
    else:
        parser.error("provide text or --serve")


if __name__ == "__main__":
    main()
