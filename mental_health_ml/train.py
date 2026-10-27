#!/usr/bin/env python3
"""Train and gate the support-topic model on a group-held-out split."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import FeatureUnion, Pipeline

ROOT = Path(__file__).resolve().parent
DATASET = ROOT / "data" / "support_topics.csv"
EVALUATION = ROOT / "data" / "evaluation.csv"
MODEL = ROOT / "artifacts" / "support_topic_model.joblib"
METRICS = ROOT / "artifacts" / "metrics.json"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--minimum-macro-f1", type=float, default=0.75)
    args = parser.parse_args()

    frame = pd.read_csv(DATASET).dropna()
    splitter = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=20261027)
    train_index, test_index = next(splitter.split(frame.text, frame.label, frame.group_id))
    train, test = frame.iloc[train_index], frame.iloc[test_index]

    features = FeatureUnion(
        [
            (
                "word",
                TfidfVectorizer(
                    lowercase=True,
                    strip_accents="unicode",
                    ngram_range=(1, 2),
                    sublinear_tf=True,
                    min_df=2,
                    max_features=35_000,
                ),
            ),
            (
                "char",
                TfidfVectorizer(
                    analyzer="char_wb",
                    lowercase=True,
                    ngram_range=(3, 5),
                    sublinear_tf=True,
                    min_df=2,
                    max_features=45_000,
                ),
            ),
        ]
    )
    pipeline = Pipeline(
        [
            ("features", features),
            (
                "classifier",
                LogisticRegression(
                    max_iter=1_500,
                    class_weight="balanced",
                    random_state=20261027,
                ),
            ),
        ]
    )
    pipeline.fit(train.text, train.label)
    predictions = pipeline.predict(test.text)
    probabilities = pipeline.predict_proba(test.text)
    labels = list(pipeline.classes_)
    macro_f1 = float(f1_score(test.label, predictions, average="macro"))
    accuracy = float(accuracy_score(test.label, predictions))
    report = classification_report(test.label, predictions, output_dict=True, zero_division=0)

    evaluation = pd.read_csv(EVALUATION).dropna()
    evaluation_predictions = pipeline.predict(evaluation.text)
    evaluation_accuracy = float(accuracy_score(evaluation.label, evaluation_predictions))
    evaluation_macro_f1 = float(
        f1_score(evaluation.label, evaluation_predictions, average="macro")
    )

    metrics = {
        "dataset": {
            "rows": int(len(frame)),
            "source": "synthetic_non_identifiable",
            "classes": labels,
        },
        "split": {
            "strategy": "group_shuffle_by_base_utterance",
            "trainRows": int(len(train)),
            "testRows": int(len(test)),
            "trainGroups": int(train.group_id.nunique()),
            "testGroups": int(test.group_id.nunique()),
        },
        "accuracy": accuracy,
        "macroF1": macro_f1,
        "independentSyntheticEvaluation": {
            "rows": int(len(evaluation)),
            "accuracy": evaluation_accuracy,
            "macroF1": evaluation_macro_f1,
            "note": "Manually authored synthetic examples; not clinical validation.",
        },
        "meanTopConfidence": float(probabilities.max(axis=1).mean()),
        "classificationReport": report,
        "confusionMatrix": confusion_matrix(test.label, predictions, labels=labels).tolist(),
        "limitations": [
            "Synthetic evaluation does not establish clinical validity.",
            "Labels are support topics, not diagnoses.",
            "Performance must be re-evaluated on consented, clinician-reviewed local data.",
        ],
    }

    gate_score = min(macro_f1, evaluation_macro_f1)
    if gate_score < args.minimum_macro_f1:
        raise SystemExit(
            f"Model rejected: gated macro F1 {gate_score:.3f} is below {args.minimum_macro_f1:.3f}"
        )

    MODEL.parent.mkdir(parents=True, exist_ok=True)
    # Once evaluation passes, refit on every generated training row. The fixed
    # independent evaluation remains untouched and recorded above.
    pipeline.fit(frame.text, frame.label)
    joblib.dump(pipeline, MODEL)
    METRICS.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps({
        "groupHeldOutAccuracy": accuracy,
        "groupHeldOutMacroF1": macro_f1,
        "independentSyntheticAccuracy": evaluation_accuracy,
        "independentSyntheticMacroF1": evaluation_macro_f1,
        "model": str(MODEL),
    }, indent=2))


if __name__ == "__main__":
    main()
