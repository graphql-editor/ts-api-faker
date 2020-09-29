import * as helpers from '../../src/helpers/helpers';

describe('helpers tests', () => {
  it('returns a random number from the given range', () => {
    const num = helpers.randomNumber(0, 10);
    expect(num).toBeDefined();
    expect(num).toBeGreaterThanOrEqual(0);
    expect(num).toBeLessThanOrEqual(10);
  });

  it('returns random element from array', () => {
    const arr = ['one', 'two', 'three'];
    const element = helpers.randomElementFromArray(arr);
    expect(element).toBeDefined();
    expect(arr).toContain(element);
  });

  it('checks if the entered value is an object type', () => {
    expect(helpers.isObject({})).toBeTruthy();
    expect(helpers.isObject(Object.create({}))).toBeTruthy();
    expect(helpers.isObject(Number)).toBeFalsy();
    expect(helpers.isObject([])).toBeFalsy();
    expect(helpers.isObject(1)).toBeFalsy();
    expect(helpers.isObject('')).toBeFalsy();
  });

  it('checks if the string entered has the number', () => {
    expect(helpers.isNumber('1')).toBeTruthy();
    expect(helpers.isNumber('abc')).toBeFalsy();
  });

  it('returns random date', () => {
    const randomDate = helpers.randomDate();
    expect(randomDate).toBeDefined();
    expect(randomDate).toBe(new Date(randomDate).toISOString());
  });

  it('returns a link to the photo', () => {
    const photo = helpers.resolveImages('camera', 600, 800);
    expect(photo).toBeDefined();
    expect(photo).toStrictEqual('https://source.unsplash.com/600x800/?camera');
  });
});
