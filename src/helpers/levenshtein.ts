import * as levenshtein from 'fast-levenshtein';
import LRU from 'lru-cache';

import { keyMapObject } from '@app/helpers/assets';

// 5MB Cache
const lru = new LRU({
  max: 5 * 1024 * 1024,
  maxAge: 1000 * 60 * 60,
  length: (n: string, key: string): number => {
    return n.length + key.length;
  },
});

export const compare = (entry: string, all: keyMapObject[]): string => {
  if (lru.has(entry)) {
    return lru.get(entry);
  }

  let minDistance = Infinity;
  let bestMatch = entry;
  for (const st of all) {
    [st.name, st.value, st.key].forEach((value) => {
      // short path, minDistance is alread at zero
      // no need for further checks
      if (!minDistance) {
        return;
      }
      const distance = levenshtein.get(entry, value);
      if (distance < minDistance) {
        bestMatch = st.name;
        minDistance = distance;
      }
    });
    if (!minDistance) {
      break;
    }
  }

  lru.set(entry, bestMatch);
  return bestMatch;
};
