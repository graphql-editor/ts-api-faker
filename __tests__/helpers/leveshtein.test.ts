import { compare } from '../../src/helpers/levenshtein';

describe('levenshtein tests', () => {
  it('results are stable', () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomString = (length: number): string =>
      new Array(length)
        .fill('')
        .map(() => chars[Math.floor(Math.random() * chars.length)])
        .join('');
    const keys = new Array(40).fill('').map(() => {
      const key = randomString(6);
      const value = randomString(6);
      return { name: `${key}.${value}`, mapping: { key, value } };
    });
    const first = compare('mockkey.withval', keys);
    new Array(10).fill('').forEach(() => {
      expect(compare('mockkey.withval', keys)).toEqual(first);
    });
  });
  it('checks distance on all fields', () => {
    expect(
      compare('close.value', [
        {
          name: 'far.value',
          mapping: {
            key: 'far',
            value: 'value',
          },
        },
        {
          name: 'close.value',
          mapping: {
            key: 'close',
            value: 'value',
          },
        },
      ]),
    ).toEqual('close.value'); // 0 distance on name
    expect(
      compare('close', [
        {
          name: 'far.value',
          mapping: {
            key: 'far',
            value: 'value',
          },
        },
        {
          name: 'close.value',
          mapping: {
            key: 'close',
            value: 'value',
          },
        },
      ]),
    ).toEqual('close.value'); // 0 distance on key
    expect(
      compare('value', [
        {
          name: 'far.value',
          mapping: {
            key: 'far',
            value: 'value',
          },
        },
        {
          name: 'close.value',
          mapping: {
            key: 'close',
            value: 'value',
          },
        },
      ]),
    ).toEqual('far.value'); // 0 distance on value for both, return first matching
  });
});
