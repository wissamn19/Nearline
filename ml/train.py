from pathlib import Path
import pickle

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.model_selection import train_test_split

try:
    from .featurize import featurize
except ImportError:  # pragma: no cover - allows running the file directly
    from featurize import featurize


def main() -> None:
    root = Path(__file__).resolve().parent
    data_path = root / "data" / "captures.csv"
    model_path = root / "task_model.pkl"

    df = pd.read_csv(data_path)
    df = df.dropna(subset=["text", "label"]).copy()
    df["label"] = df["label"].astype(str).str.strip().str.lower()

    X = np.asarray([featurize(text) for text in df["text"]], dtype=np.float64)
    y = (df["label"] == "task").astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)

    print(f"train size: {len(X_train)}")
    print(f"test size: {len(X_test)}")
    print(f"test accuracy: {acc:.3f}")
    print(f"test ROC AUC: {auc:.3f}")
    print("first 5 task probabilities:", y_proba[:5].tolist())

    with model_path.open("wb") as f:
        pickle.dump(model, f)

    print(f"saved trained model to: {model_path}")


if __name__ == "__main__":
    main()