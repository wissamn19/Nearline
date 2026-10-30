import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer


def featurize(text, size= 2048):
    df = pd.read_csv("./data/captures.csv")

    if text not in df.columns:
        raise ValueError(f"Column '{text}' not found in CSV.")
    df[text] = df[text].fillna('').astype(str).strip().str.lower()
    vectorizer = TfidfVectorizer(max_features= size)
    X = vectorizer.fit_transform(df[text])

    return X, vectorizer, df