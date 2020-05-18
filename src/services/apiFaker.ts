import * as faker from 'faker';

import { randomShape } from '@app/services/randomShape';
import { compare } from '@app/helpers/levenshtein';
import { keyMapObject, permittedFakerMethods, fakerExtension } from '@app/helpers/assets';
import {
  isObject,
  isNumber,
  objectFromEntries,
  randomElementFromArray,
  resolveImages,
  randomDate,
} from '@app/helpers/helpers';

const allKeys: keyMapObject[] = permittedFakerMethods
  .map((permKey) =>
    Object.keys(faker[permKey]).map((fakerMethod) => ({
      name: `${permKey}.${fakerMethod}`,
      key: permKey,
      value: fakerMethod,
    })),
  )
  .reduce((a, b) => [...a, ...b])
  .concat(fakerExtension);

export const fakeValue = (word: string): string => {
  const data: string = word;
  if (data.length <= 0) {
    return data;
  }

  let [key, value, arg1, arg2]: string[] = data.match(/\w+/g);

  if (['data', 'key', 'use', 'svg'].includes(key)) {
    return data;
  }

  switch (key) {
    case 'shape':
      return randomShape(value);
    case 'image':
    case 'photo':
    case 'picture':
      key = 'image';
      if (typeof faker[key][value] !== 'undefined') {
        break;
      }
      return resolveImages(value || 'image', parseInt(arg1 || '200'), parseInt(arg2 || '200'));
    case 'gender':
      return randomElementFromArray(['male', 'female', 'unset']);
    case 'date':
      if (typeof faker[key][value] !== 'undefined') {
        break;
      }
      return randomDate();
    default:
      break;
  }

  //? pipes ex.date format

  if (typeof faker[key] !== 'undefined' && typeof faker[key][value] !== 'undefined') {
    const output = faker[key][value](arg1, arg2);
    return output;
  }

  if (
    !(typeof faker[key] !== 'undefined' && typeof faker[key][value] !== 'undefined') &&
    /^\w+\D(\.)\w+\D$/.test(data)
  ) {
    return fakeValue(compare(`${key}.${value}`, allKeys));
  }

  return data;
};

const passDecode = (obj: object, fakerFunc: CallableFunction, directive?: string): object => {
  const data = obj;
  const decoder = fakerFunc;
  const dir = directive || '';
  let pattern = /''/g;
  dir !== '' ? (pattern = new RegExp(`@(${dir}:?)`, 'g')) : null;
  for (const key in data) {
    if (typeof data[key] === 'string' && data[key].includes(dir)) {
      pattern !== /''/g ? (data[key] = data[key].replace(pattern, '')) : null;
      data[key] = decoder(data[key]);
    }
    Array.isArray(data[key]) || isObject(data[key]) ? passDecode(data[key], decoder, dir) : null;
  }
  return data;
};

const passRepeat = <T>(obj: object | Array<T>): object => {
  const data = obj;
  for (const key in data) {
    if (typeof data[key] === 'string' && data[key].includes('@repeat')) {
      data[key] = data[key].replace(/@(repeat:?)/g, '');
      let rep: string = data[key];
      if (data[key].includes(',')) {
        rep = rep.match(/\w+/g).find((el) => isNumber(el));
        data[key] = data[key].replace(/\d,?/g, '');
        for (let i = 0; i < parseInt(rep); i++) {
          Array.isArray(data) ? data.push(data[key]) : null;
        }
      } else {
        Array.isArray(data) ? data.splice(data.indexOf(data[key]), 1) : null;
        for (let i = 0; i < parseInt(rep); i++) {
          Array.isArray(data) ? data.push(data[data.length - 1]) : null;
        }
      }
    }
    Array.isArray(data[key]) || isObject(data[key]) ? passRepeat(data[key]) : null;
  }
  return data;
};

const passKeyDirective = (obj: object, entry: string): object => {
  const data = obj;
  for (const key in data) {
    if (isObject(data[key])) {
      data[key] = objectFromEntries(
        Object.entries<string>(data[key]).map(([keys, val]) => {
          typeof val === 'string' && val.trim() === '@key' && typeof faker[keys] !== 'undefined'
            ? (val = faker[keys][randomElementFromArray(Object.keys(faker[keys]))]())
            : null;
          return [keys, val];
        }),
      );
    }
    Array.isArray(data[key]) || isObject(data[key]) ? passKeyDirective(data[key], entry) : null;
  }
  return data[entry];
};

const passSettings = (obj: object, parent?: object): object => {
  const data = obj;
  const parentData = parent || obj;
  if (typeof parentData['data'] || parentData['definitions'] !== 'undefined') {
    for (const key in data) {
      if (typeof data[key] === 'string' && /@(use|data):?/g.test(data[key])) {
        const entries: Array<string> = data[key].match(/\w+/g);
        let entry = '';

        if (/@(data):?/g.test(data[key])) {
          entry = entries.find((el) => /^data/.test(el));
          entries.splice(entries.indexOf(entry), 1);
          const startingPoint = parentData['@settings'][entry];
          let result: string | object = '';
          entries.map((el) => {
            if (typeof startingPoint[el] !== 'undefined') {
              return (result = startingPoint[el]);
            }

            if (typeof result[el] !== 'undefined') {
              return (result = result[el]);
            }
          });
          data[key] = result;
        }

        if (/@(use):?/g.test(data[key])) {
          entry = entries.find((el) => /^use/.test(el));
          entries.splice(entries.indexOf(entry), 1);
          data[key] = parentData['@settings']['definitions'][entries.map((el) => el)];
        }
      }
      Array.isArray(data[key]) || isObject(data[key]) ? passSettings(data[key], parentData) : null;
    }
  }
  return data;
};

export const createResponse = (parsedReq: string): string => {
  let preparedData: object = JSON.parse(parsedReq);
  preparedData = passDecode(preparedData, fakeValue, 'static');
  preparedData = passRepeat(preparedData);
  preparedData = passKeyDirective({ '0': preparedData }, '0');
  if (!Array.isArray(preparedData)) {
    preparedData = passSettings(preparedData);
    if (typeof preparedData['@settings'] !== 'undefined') {
      if (
        typeof preparedData['@settings']['root'] !== 'undefined' &&
        preparedData['@settings']['root'] &&
        typeof preparedData[Object.keys(preparedData)[1]] === 'object'
      ) {
        preparedData = preparedData[Object.keys(preparedData)[1]];
      }
      delete preparedData['@settings'];
    }
  }

  preparedData = passDecode(JSON.parse(JSON.stringify(preparedData)), fakeValue);
  return JSON.stringify(preparedData);
};
