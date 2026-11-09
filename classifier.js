function fnv1a(data) {
    let hash = 2166136261;
    for (const byte of data) {
        hash = Math.imul(hash ^ byte, 16777619) >>> 0;
    }
    return hash;
}

function featurize(text, size = 2048) {
    const normalized = text.toLowerCase().trim().split(/\s+/).filter(Boolean).join(" ");
    const characters = Array.from(` ${normalized} `);
    const counts = Array(size).fill(0);

    for (const n of [2, 3, 4]) {
        for (let i = 0; i <= characters.length - n; i++) {
            const gram = characters.slice(i, i + n).join("");
            const index = fnv1a(new TextEncoder().encode(gram)) % size;
            counts[index]++;
        }
        
    }
    return counts;
}

function pTask(text) {
  const c = featurize(text);
  let z = NEARLINE_MODEL.intercept;
  for (let i = 0; i < c.length; i++) z += NEARLINE_MODEL.coef[i] * c[i];
  return 1 / (1 + Math.exp(-z));
}



