import * as faker from 'faker';
import getRandomShape from './getRandomShape';
import { compare, keyMapObject } from './levenshtein';

const resolveImages = ({ name, width, height }: { name: string; width: number; height: number }): string =>
  `https://source.unsplash.com/${width}x${height}/?${name}`;

function randomGender(): string {
  const genders = ['male', 'female', 'unset'];
  return genders[Math.floor(Math.random() * genders.length)];
}

function randomDate(): string {
  const now = new Date();
  const helper = new Date(2012, 0, 1);
  return new Date(helper.getTime() + Math.random() * (now.getTime() - helper.getTime())).toISOString();
}
const imageTypes = ['image', 'picture', 'photo'];
const allKeys: keyMapObject[] = [
  'address',
  'commerce',
  'company',
  'database',
  'finance',
  'hacker',
  'helpers',
  'internet',
  'lorem',
  'name',
  'phone',
  'random',
  'system',
]
  .map((k) => Object.keys(faker[k]).map((fk) => ({ name: `${k}.${fk}`, key: k, value: fk })))
  .reduce((a, b) => [...a, ...b])
  .concat([
    {
      name: 'image',
      value: 'image',
      key: 'image',
    },
    {
      name: 'gender',
      value: 'gender',
      key: 'gender',
    },
    {
      name: 'shape.circle',
      key: 'shape',
      value: 'circle',
    },
    {
      name: 'shape.square',
      key: 'shape',
      value: 'square',
    },
    {
      name: 'shape.triangle',
      key: 'shape',
      value: 'triangle',
    },
    {
      name: 'shape.rectangle',
      key: 'shape',
      value: 'rectangle',
    },
  ]);

interface RawValue {
  raw: unknown;
}
function isRawValue(v: RValueOrArrayValue): v is RawValue {
  return v && typeof v === 'object' && 'raw' in v;
}
interface FakeValue {
  fake: string;
}
interface ObjectValue {
  fields: { [k: string]: RValueOrArrayValue };
}
function isObjectValue(v: RValueOrArrayValue): v is ObjectValue {
  return v && typeof v === 'object' && 'fields' in v;
}
type Value = RawValue | FakeValue | ObjectValue;
type ValueOrArrayValue = Value | Array<RValueOrArrayValue>;
export type RValueOrArrayValue = Value | Array<ValueOrArrayValue>;
function isArrayValue(v: RValueOrArrayValue): v is Array<ValueOrArrayValue> {
  return Array.isArray(v);
}

export function iterateAllValuesFaker(data: RValueOrArrayValue, key?: string): unknown {
  const handleValue = (value: RValueOrArrayValue, key?: string): unknown => {
    try {
      if (value === null) {
        return value;
      }
      if (isRawValue(value)) {
        return value.raw;
      }
      if (isObjectValue(value)) {
        return Object.keys(value.fields).reduce(
          (pv, cv) => ({
            [cv]: handleValue(value.fields[cv], cv),
            ...pv,
          }),
          {},
        );
      }
      if (isArrayValue(value)) {
        return value.map((v) => handleValue(v, key));
      }

      const [k, f, x, y] = value.fake.split('.');
      // short path, if we have an exact
      // match for supplied value,
      // return it
      if (typeof faker[k] !== 'undefined' && typeof faker[k][f] !== 'undefined') {
        return faker[k][f](x, y);
      }
      switch (k) {
        case 'shape':
          return getRandomShape(f);
        case 'image':
          return resolveImages({
            name: f || key || 'image',
            width: parseInt(x || '200'),
            height: parseInt(y || x || '200'),
          });
        case 'gender':
          return randomGender();
        case 'date':
          return randomDate();
        default: {
          const [isImageType] = imageTypes.filter((i) =>
            typeof key === 'undefined' ? undefined : key.toLowerCase().match(i.toLowerCase()),
          );
          if (isImageType) {
            return handleValue(
              { fake: ['image', f, x, y].join('.').replace(/\.*$/, '') },
              key.toLowerCase().replace(isImageType, ''),
            );
          }
          if (value.fake === 'String' || value.fake === 'string') {
            if (typeof key === 'undefined') {
              return faker.lorem.word();
            }
            return handleValue({ fake: compare(key, allKeys) }, key);
          }
          throw new Error(`${value.fake} is not a valid faker value`);
        }
      }
    } catch (e) {
      return `<<field could not be faked, reason: ${e.message}>>`;
    }
  };
  return handleValue(data, key);
}
