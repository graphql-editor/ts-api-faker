export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
export function randomElementFromArray<T>(arr: Array<T>): T {
  return arr[randomNumber(0, arr.length - 1)];
}
export function isNumber(entry: string): boolean {
  return !isNaN(parseFloat(entry));
}
export function isObject(v: unknown): v is object {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
export function randomDate(): string {
  const now = new Date();
  const helper = new Date(2012, 0, 1);
  return new Date(helper.getTime() + Math.random() * (now.getTime() - helper.getTime())).toISOString();
}
export function resolveImages(name: string, width: number, height: number): string {
  return `https://source.unsplash.com/${width}x${height}/?${name}`;
}

export function traverseData(data: unknown, withLeaf: (leaf: string, path: string) => unknown, path?: string): unknown {
  path = path || '';
  if (typeof data === 'string') {
    return withLeaf(data, path);
  }
  if (isObject(data)) {
    const objectReducer = (pv: object, [key, value]): object => {
      pv[key] = traverseData(value, withLeaf, path + '.' + key);
      return pv;
    };
    data = Object.entries(data).reduce(objectReducer, {});
  } else if (Array.isArray(data)) {
    data = data.map((el, idx) => traverseData(el, withLeaf, path + '[' + idx.toString() + ']'));
  }
  return data;
}
