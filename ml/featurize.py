from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer


def featurize(text="text", size= 2048):
    
    df = pd.read_csv("./data/captures.csv")

    if text not in df.columns:
        raise ValueError(f"Column '{text}' not found in CSV.")
    df[text] = df[text].fillna("").astype(str).str.strip().str.lower()
    vectorizer = TfidfVectorizer(max_features= size)
    X = vectorizer.fit_transform(df[text])

    return X, vectorizer, df

if __name__ == "__main__":
    X, vectorizer, df = featurize()
    print("Feature matrix shape:", X.shape)
    print("Rows loaded:", len(df))
    print("Features:", vectorizer.get_feature_names_out())
    print(X.toarray())