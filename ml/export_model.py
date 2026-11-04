import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression

from featurize import featurize

root = Path(__file__).resolve().parent
df = pd.read_csv(root / "data" / "captures.csv").dropna(subset=["text", "label"])

X = np.asarray([featurize(t) for t in df["text"]], dtype=np.float64)
y = (df["label"].astype(str).str.strip().str.lower() == "task").astype(int)

# Final model: fit on ALL rows (evaluation already happened in train.py)
model = LogisticRegression(max_iter=1000).fit(X, y)

out = {
    "size": 2048,
    "intercept": round(float(model.intercept_[0]), 6),
    "coef": [round(float(w), 6) for w in model.coef_[0]],
}
(root / "model.json").write_text(json.dumps(out))
# The same data as a script, so the app also works when opened straight from a file
(root / "model.js").write_text("const NEARLINE_MODEL = " + json.dumps(out) + ";\n")

# The whole model is this: a weighted sum, then a sigmoid. JavaScript will do the same.
w, b = np.array(out["coef"]), out["intercept"]
def p_task(text):
    z = b + float(np.dot(w, featurize(text)))
    return 1 / (1 + np.exp(-z))

for text in ["buy milk", "recipe from grandma", "call mom", "idea for the landing page"]:
    print(f"{p_task(text):.6f}  {text}")
print("saved", root / "model.json", "-", round((root / "model.json").stat().st_size / 1024), "KB")