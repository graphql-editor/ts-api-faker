export const randomNumber = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1) + min);
export const randomElementFromArray = <T> (arr: Array<T>): T => arr[randomNumber(0, arr.length - 1)];
export const isObject = (obj:  object | string | number): boolean => Object.prototype.toString.call(obj) === '[object Object]';
export const isNumber = (entry: string): boolean => !isNaN(parseFloat(entry));
export const objectFromEntries = (arr: [string|number, string|number][]): object => {
    const obj = {};
    for (const pair of arr) {
        if (Object(pair) !== pair) {
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
