import * as faker from 'faker';

import { randomShape } from '@app/services/randomShape';
import { compare } from '@app/helpers/levenshtein';
import { keyMapObject, permittedFakerMethods, fakerExtension } from '@app/helpers/assets';
import { isObject, isNumber, randomElementFromArray, resolveImages, randomDate } from '@app/helpers/helpers';

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

const removeDir = (data: string, dir: string): string => {
  if (data.startsWith('@' + dir + ':')) {
    data = data.slice(dir.length + 2);
  } else {
    data = data.slice(0, data.length - dir.length - 1);
  }
  return data;
};

const isDir = (data: string, dir: string): boolean => {
  const at = data.indexOf('@');
  if (at === -1) {
    return false;
  }
  if (at !== data.lastIndexOf('@')) {
    return false;
  }
  if (at === 0) {
    return data.slice(1).startsWith(dir);
  }
  return data.endsWith('@' + dir);
};

export const fakeValue = (word: string): string => {
  if (isDir(word, 'data')) {
    return word;
  }
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

  return fakeValue(compare(data, allKeys));
};

const passDecode = (obj: unknown, fakerFunc: CallableFunction, directive?: string): unknown => {
  if (typeof obj !== 'object') {
    return obj;
  }
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

const passRepeat = <T>(obj: unknown | Array<T>): unknown => {
  if (typeof obj !== 'object') {
    return obj;
  }
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

const passKeyDirective = (obj: unknown): unknown => {
  if (typeof obj !== 'object') {
    return obj;
  }
  const data = obj;
  if (Array.isArray(data)) {
    return data.map((v) => passKeyDirective(v));
  }
  if (!data || typeof data !== 'object') {
    return data;
  }
  for (const key in data) {
    data[key] = typeof data[key] == 'string' && data[key].trim() === '@key' ? key : passKeyDirective(data[key]);
  }
  return data;
};

interface SettingsWithUse {
  definitions: {
    [k: string]: unknown;
  };
}
function isSettingsWithUse(v: object): v is SettingsWithUse {
  if (typeof v !== 'object') {
    return false;
  }
  if (typeof v['definitions'] !== 'object') {
    return false;
  }
  return true;
}

const followPath = (data: string, v: object): unknown => {
  if (!v) {
    return v;
  }
  if (data.indexOf('.') === -1) {
    return v[data];
  }
  const k = data.slice(0, data.indexOf('.'));
  data = data.slice(data.indexOf('.') + 1);
  return followPath(data, v[k]);
};

const passSettingsUse = (obj: unknown, settings?: object): unknown => {
  let data = obj;
  if (!isSettingsWithUse(settings)) {
    return data;
  }
  if (typeof data === 'string' && isDir(data, 'use')) {
    data = followPath(removeDir(data, 'use'), settings.definitions);
    return passSettingsUse(data, settings);
  }
  if (typeof data === 'object' && obj !== null) {
    if (Array.isArray(data)) {
      data = data.map((el) => passSettingsUse(el, settings));
    } else {
      for (const key in data) {
        data[key] = passSettingsUse(data[key], settings);
      }
    }
  }
  return data;
};

interface SettingsWithData {
  data: {
    [k: string]: unknown;
  };
}
function isSettingsWithData(v: object): v is SettingsWithData {
  if (typeof v !== 'object') {
    return false;
  }
  if (typeof v['data'] !== 'object') {
    return false;
  }
  return true;
}

const passSettingsData = (obj: unknown, settings?: object): unknown => {
  let data = obj;
  if (!isSettingsWithData(settings)) {
    return data;
  }
  if (typeof data === 'string' && isDir(data, 'data')) {
    data = followPath(removeDir(data, 'data'), settings.data);
    return passSettingsData(data, settings);
  }
  if (typeof data === 'object' && obj !== null) {
    if (Array.isArray(data)) {
      data = data.map((el) => passSettingsData(el, settings));
    } else {
      for (const key in data) {
        data[key] = passSettingsData(data[key], settings);
      }
    }
  }
  return data;
};

export const createResponse = (parsedReq: string): string => {
  let preparedData: unknown = JSON.parse(parsedReq);
  preparedData = passDecode(preparedData, fakeValue, 'static');
  preparedData = passRepeat(preparedData);
  preparedData = passKeyDirective(preparedData);
  const settings = preparedData['@settings'];
  delete preparedData['@settings'];
  if (typeof settings !== 'undefined') {
    if (settings.root) {
      preparedData = preparedData[Object.keys(preparedData)[0]];
    }
  }
  preparedData = passSettingsUse(preparedData, settings);
  preparedData = passDecode(preparedData, fakeValue);
  preparedData = passSettingsData(preparedData, settings);
  return JSON.stringify(preparedData);
};
