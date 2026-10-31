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

try:
    from .featurize import featurize
except ImportError:  # pragma: no cover - allows running the file directly
    from featurize import featurize

root = Path(__file__).resolve().parent

df = pd.read_csv(root / "data" / "captures.csv")

# Build the matrices
X = np.asarray([featurize(text) for text in df["text"]], dtype=np.float64)
y = (df["label"] == "task").astype(int)

cv = RepeatedStratifiedKFold(n_splits=5, n_repeats=10, random_state=42)
prediction_cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
model = LogisticRegression(max_iter=1000)

scores = cross_val_score(model, X, y, cv=cv)
probs = cross_val_predict(model, X, y, cv=prediction_cv, method="predict_proba")[:, 1]

print(f"mean CV accuracy: {scores.mean():.3f}")
print(f"std CV accuracy: {scores.std():.3f}")
print("first 5 task probabilities:", probs[:5].tolist())