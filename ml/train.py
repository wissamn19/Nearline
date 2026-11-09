from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import (
    RepeatedStratifiedKFold,
    StratifiedKFold,
    cross_val_predict,
    cross_val_score,
)

from featurize import featurize

root = Path(__file__).resolve().parent
df = pd.read_csv(root / "data" / "captures.csv").dropna(subset=["text", "label"]).copy()
df["label"] = df["label"].astype(str).str.strip().str.lower()

X = np.asarray([featurize(t) for t in df["text"]], dtype=np.float64)
y = (df["label"] == "task").astype(int).to_numpy()

model = LogisticRegression(max_iter=1000)

# 1. How good is it? Cross-validation instead of one lucky split.
cv = RepeatedStratifiedKFold(n_splits=5, n_repeats=10, random_state=42)
acc = cross_val_score(model, X, y, cv=cv, scoring="accuracy")
auc = cross_val_score(model, X, y, cv=cv, scoring="roc_auc")
print(f"accuracy: {acc.mean():.3f} +/- {acc.std():.3f}")
print(f"ROC AUC:  {auc.mean():.3f} +/- {auc.std():.3f}")

# 2. Each row's probability, predicted by a model that never saw that row.
probs = cross_val_predict(
    model, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=42), method="predict_proba"
)[:, 1]
df["p_task"] = probs.round(2)

# 3. The mistakes.
wrong = df[(probs >= 0.5) != (y == 1)].sort_values("p_task")
print(f"\nwrong at cutoff 0.5: {len(wrong)} of {len(df)}")
print(wrong[["text", "label", "p_task"]].to_string(index=False))

# 4. Choosing the cutoff: task if p_task >= t, otherwise note.
print("\ncutoff  accuracy  tasks kept as task  notes caught as note")
for t in (0.3, 0.4, 0.5, 0.6, 0.7):
    pred = (probs >= t).astype(int)
    print(f"{t:>6}  {(pred == y).mean():>8.3f}  {pred[y == 1].mean():>18.3f}  {1 - pred[y == 0].mean():>20.3f}")