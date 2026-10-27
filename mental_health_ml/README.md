# eUdyaan support-topic classifier

This model classifies the topic and support urgency of a message. It is not a
diagnostic model and must never be presented as one. A depression diagnosis,
for example, requires duration, impairment, clinical history, and professional
assessment that cannot be inferred from one chat message.

The bundled corpus is synthetic and contains no scraped or identifiable user
text. It intentionally includes informal student English and some Hinglish-like
phrasing. Replace or supplement it only with consented, de-identified,
ethically approved data and preserve a separately reviewed test set.

Run:

```bash
python3 mental_health_ml/generate_dataset.py
python3 mental_health_ml/train.py --minimum-macro-f1 0.75
python3 mental_health_ml/infer.py "I feel left out when my friends post stories"
```

`train.py` splits by base seed rather than by augmented row. This prevents
near-duplicate variants of one sentence appearing in both train and test.
The exported artifact is rejected unless held-out macro F1 is at least 0.75.
Production release still requires clinician review, subgroup testing, drift
monitoring, and human escalation procedures.
