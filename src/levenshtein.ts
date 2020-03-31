import * as levenshtein from 'fast-levenshtein';
import LRU from 'lru-cache';

export type keyMapObject = {
  name: string;
  key: string;
  value: string;
};

// 5MB Cache
const lru = new LRU({
  max: 5 * 1024 * 1024,
  maxAge: 1000 * 60 * 60,
  length: (n: string, key: string): number => {
    return n.length + key.length;
  },
});

export const compare = (s: string, all: keyMapObject[]): string => {
  if (lru.has(s)) {
    return lru.get(s);
  }
  let minDistance = Infinity;
  let bestMatch = s;
  for (const st of all) {
    [st.name, st.value, st.key].forEach((v) => {
      // short path, minDistance is alread at zero
      // no need for further checks
      if (!minDistance) {
        return;
      }
      const distance = levenshtein.get(s, v);
      if (distance < minDistance) {
        bestMatch = st.name;
        minDistance = distance;
      }
    });
    if (!minDistance) {
      break;
    }
  }
  lru.set(s, bestMatch);
  return bestMatch;
};
