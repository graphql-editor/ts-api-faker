import * as levenshtein from "fast-levenshtein";
import * as LRU from "lru-cache"

export type keyMapObject = {
  name: string;
  key: string;
  value: string;
};

// 5MB Cache 
var lru = new LRU({
  max: 5 * 1024 * 1024,
  maxAge: 1000 * 60 * 60,
  length: (n: string, key: string) => { return n.length + key.length }
})

export const compare = (s: string, all: keyMapObject[]) => {
  if (lru.has(s)) {
    return lru.get(s)
  }
  let minDistance = Infinity;
  let bestMatch = s;
  for (var st of all) {
    const distance = levenshtein.get(s, st.name);
    if (distance < minDistance) {
      bestMatch = st.name;
      minDistance = distance;
    }
    const distance1 = levenshtein.get(s, st.value);
    if (distance1 < minDistance) {
      bestMatch = st.name;
      minDistance = distance1;
    }
    const distance2 = levenshtein.get(s, st.key);
    if (distance2 < minDistance) {
      bestMatch = st.name;
      minDistance = distance2;
    }
  }
  lru.set(s, bestMatch)
  return bestMatch;
};
