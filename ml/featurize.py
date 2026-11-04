def fnv1a(data: bytes) -> int:
    h = 2166136261
    for b in data:
        h ^= b
        h = (h * 16777619) & 0xFFFFFFFF
    return h 

def featurize(text: str, size: int = 213) -> list[int]:

    text = " ".join(text.lower().split())
    padded = " "+ text +" "
    counts = [0] * size
    for n in (2, 3, 4):
      for i in range(len(padded) - n + 1):
        gram = padded [i:i + n]
        index = fnv1a(gram.encode("utf-8")) % size
        counts[index] += 1
    return counts
        
"""
print(fnv1a(b""), 2166136261)
print(fnv1a(b"a"), 0xE40C292C)
print(fnv1a(b"foobar"), 0xBF9CF968)

def checksum(v): 
    return sum(i * c for i, c in enumerate(v))

v = featurize("buy milk")
print(len(v) == 2048 and sum(v) == 24 and checksum(v) == 21941)
print(featurize("Buy  Milk ") == v)         # normalization works
print(sum(featurize("café")) == 12 and checksum(featurize("café")) == 10138)
print(checksum(featurize("call mom")) == 28353)
print(sum(featurize("")) == 1)
print("all good")
"""
