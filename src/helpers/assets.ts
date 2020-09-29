import { randomShape } from '@app/helpers/randomShape';
import { randomElementFromArray, resolveImages, randomDate } from '@app/helpers/helpers';
import * as faker from 'faker';

interface FakerMapping {
  key: string;
  value: string;
}
export function isFakerMapping(v: unknown): v is FakerMapping {
  return typeof v === 'object' && v !== null && 'key' in v && 'value' in v;
}
type mappingFunc = (...args: unknown[]) => unknown;
export type keyMapObject = {
  name: string;
  mapping: FakerMapping | mappingFunc;
};

function tryNumber(v: unknown): number | undefined {
  if (typeof v === 'number') {
    return v;
  }
  if (typeof v === 'string') {
    return parseInt(v);
  }
}

function imageAlias(...args: unknown[]): unknown {
  args.shift();
  if (typeof args[0] === 'string' && typeof faker.image[args[0]] !== 'undefined') {
    return faker.image[args[0]](...args.slice(1));
  }
  const name = typeof args[0] === 'string' ? (args.shift() as string) : 'image';
  const w = tryNumber(args.shift()) || 200;
  const h = tryNumber(args.shift()) || 200;
  return resolveImages(name, w, h);
}

function dateAlias(...args: unknown[]): unknown {
  if (typeof args[0] === 'string' && typeof faker.date[args[0]] !== 'undefined') {
    return faker.date[args[0]](...args.slice(1));
  }
  return randomDate();
}

function shapeAlias(...args: unknown[]): unknown {
  args.shift();
  const shape = typeof args[0] === 'string' ? args[0] : '';
  return randomShape(shape);
}

export const colors: Array<string> = ['red', '#00ff00', 'rgb(0, 0, 255)', 'rgba(0, 255, 200, 0.5)'];

export const permittedFakerMethods: Array<string> = [
  'address',
  'commerce',
  'company',
  'database',
  'date',
  'finance',
  'hacker',
  'helpers',
  'internet',
  'lorem',
  'name',
  'phone',
  'random',
  'system',
];

export const fakerExtension: keyMapObject[] = [
  {
    name: 'image',
    mapping: {
      value: 'image',
      key: 'image',
    },
  },
  {
    name: 'gender',
    mapping: {
      value: 'gender',
      key: 'gender',
    },
  },
  {
    name: 'shape',
    mapping: shapeAlias,
  },
  {
    name: 'shape.circle',
    mapping: shapeAlias,
  },
  {
    name: 'shape.square',
    mapping: shapeAlias,
  },
  {
    name: 'shape.triangle',
    mapping: shapeAlias,
  },
  {
    name: 'shape.rectangle',
    mapping: shapeAlias,
  },
  {
    name: 'image',
    mapping: imageAlias,
  },
  {
    name: 'photo',
    mapping: imageAlias,
  },
  {
    name: 'picture',
    mapping: imageAlias,
  },
  {
    name: 'gender',
    mapping: (): unknown => randomElementFromArray(['male', 'female', 'unset']),
  },
  {
    name: 'date',
    mapping: dateAlias,
  },
];
