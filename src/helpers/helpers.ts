export const getRandomNumber = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1) + min);
export const getRandomElementFromArray = <T> (arr: Array<T>): T => arr[getRandomNumber(0, arr.length - 1)];
export const isArray = (arr: object | string | number): boolean => Array.isArray(arr);
export const isObject = (obj:  object | string | number): boolean => Object.prototype.toString.call(obj) === '[object Object]';
export const isNumber = (entry: string): boolean => !isNaN(parseFloat(entry));
// es2019 polifill Object.fromEntries | node >= 12 
export const objectFromEntries = (arr: [string|number, string|number][]) => {
    const obj = {};
    for (const pair of arr) {
        if (Object(pair) !== pair) {
            // throw new TypeError('iterable for fromEntries should yield objects');
            return;
        }
        const { '0': key, '1': val } = pair;
        Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: val,
        });
    }
    return obj;
};
