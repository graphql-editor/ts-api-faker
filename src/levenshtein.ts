import * as levenshtein from "fast-levenshtein";

export type keyMapObject = {
  name: string;
  key: string;
  value: string;
};

export const compare = (s: string, all: keyMapObject[]) => {
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
  console.log(s, bestMatch);
  return bestMatch;
};
