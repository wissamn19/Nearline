import pandas as pd
df = pd.read_csv("captures.csv")
print(df.label.value_counts())
print("duplicates:", df.text.str.lower().str.strip().duplicated().sum())
print(df.groupby("label").text.apply(lambda s: s.str.len().mean()))