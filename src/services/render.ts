import * as faker from 'faker';

import { isObject, traverseData } from '@app/helpers/helpers';
import { compare } from '@app/helpers/levenshtein';
import { isFakerMapping, keyMapObject, permittedFakerMethods, fakerExtension } from '@app/helpers/assets';
import { Directive, Decoder, DirectivePrefix } from './directives';
import { Settings } from './settings';
import { DataDirective, KeyDirective, PreRenderStatic, PostRenderStatic, UseDirective } from './directives';

const allKeys: keyMapObject[] = permittedFakerMethods
  .map((permKey) =>
    Object.keys(faker[permKey]).map(
      (fakerMethod): keyMapObject => ({
        name: `${permKey}.${fakerMethod}`,
        mapping: {
          key: permKey,
          value: fakerMethod,
        },
      }),
    ),
  )
  .reduce((a, b) => [...a, ...b])
  .concat(fakerExtension)
  .sort((a, b) => (a.name < b.name ? -1 : a.name === b.name ? 0 : 1));

const callbacks = allKeys.reduce((pv, cv) => {
  if (isFakerMapping(cv.mapping)) {
    const mapping = cv.mapping;
    pv[cv.name] = (_1, _2, arg1, arg2): unknown => faker[mapping.key][mapping.value](arg1, arg2);
  } else {
    pv[cv.name] = cv.mapping;
  }
  return pv;
}, {} as Record<string, (...args: unknown[]) => unknown>);

function canonizeDirectives(data: unknown): unknown {
  return traverseData(data, (leaf: string): unknown => {
    const at = leaf.indexOf(DirectivePrefix);
    if (at > 0) {
      leaf = leaf.slice(at) + ':' + leaf.slice(0, at);
    }
    return leaf;
  });
}

function getFakerCallback(bestMatch: string, key: string, value: string): (...args: unknown[]) => unknown {
  if (`${key}.${value}` === bestMatch) {
    return (...args: unknown[]): unknown => callbacks[bestMatch](key, value, ...args);
  }
  if (callbacks[key]) {
    return (...args: unknown[]): unknown => callbacks[key](key, value, ...args);
  }
  const [bestKey, bestValue] = bestMatch.split('.');
  return (...args: unknown[]): unknown => callbacks[bestMatch](bestKey, bestValue, ...args);
}

export function fakeValue(data: string): unknown {
  if (data.length <= 0 || data.startsWith(DirectivePrefix)) {
    return data;
  }
  const [key, value, ...rest] = data.match(/\w+/g) || [];
  //? pipes ex.date format
  if (typeof faker[key] !== 'undefined' && typeof faker[key][value] !== 'undefined') {
    const output = faker[key][value](...rest);
    return output;
  }
  const bestMatch = compare(data, allKeys);
  const callback = getFakerCallback(bestMatch, key, value);
  return callback(...rest);
}

const reRepeat = /^@repeat:(\d+)$|,@repeat:(\d+)$/;
function passRepeat(obj: unknown): unknown {
  if (isObject(obj)) {
    for (const key in obj) {
      obj[key] = passRepeat(obj[key]);
    }
    return obj;
  }

  const arrayRepeatReducer = (pv: unknown[], cv: unknown, cidx: number, arr: unknown[]): unknown => {
    const handleRepeat = (cv: string): unknown[] => {
      const m = cv.match(reRepeat) || [];
      if (m.length > 0) {
        const [v, count] = m[1] ? [arr[cidx - 1], parseInt(m[1]) - 1] : [cv.replace(reRepeat, ''), parseInt(m[2])];
        return new Array(count).fill(v);
      }
      return [cv];
    };
    const nv = typeof cv === 'string' ? handleRepeat(cv) : [passRepeat(cv)];
    pv.push(...nv);
    return pv;
  };
  if (Array.isArray(obj)) {
    return obj.reduce(arrayRepeatReducer, []);
  }
  return obj;
}

class BootstrapPass {
  apply(v: unknown): unknown {
    v = canonizeDirectives(v);
    v = passRepeat(v);
    return v;
  }
}

class FakeRenderPass {
  constructor(private decoder: Decoder) {}
  apply(v: unknown): unknown {
    return traverseData(v, (leaf) => this.decoder(leaf));
  }
}

export interface RenderPass {
  apply(v: unknown, settings: Settings): unknown;
}

function compareDirectives(a: Directive, b: Directive): number {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

function equalDirectives(a: Directive, b: Directive): boolean {
  return compareDirectives(a, b) === 0;
}

class RenderDirectivesPass {
  constructor(private dirs: Directive[]) {
    const sorted = [...dirs].sort(compareDirectives);
    const duplicate = sorted.slice(1).find((v, i) => equalDirectives(v, sorted[i]));
    if (duplicate) {
      throw new Error(`duplicate ${DirectivePrefix}${duplicate.name} directive`);
    }
  }

  apply(v: unknown, settings: Settings): unknown {
    this.dirs.forEach((dir) => {
      v = this.applyDir(v, settings, dir);
    });
    return v;
  }

  private applyDir(v: unknown, settings: Settings, dir: Directive, path?: string, context?: object): unknown {
    const ctx = context || {};
    return traverseData(v, (leaf, p) => this.applyDirToValue(leaf, settings, dir, p, ctx), path);
  }

  private applyDirToValue(v: string, settings: Settings, dir: Directive, path: string, context: object): unknown {
    let retVal = dir.apply(v, settings, path, context);
    if (isObject(retVal) || Array.isArray(retVal)) {
      retVal = this.applyDir(retVal, settings, dir, path, context);
    }
    return retVal;
  }
}

export class Renderer {
  Bootstrap: RenderPass;
  Prerender: RenderPass;
  Render: RenderPass;
  Postrender: RenderPass;
  constructor(decoder: Decoder = fakeValue) {
    this.Bootstrap = new BootstrapPass();
    this.Prerender = new RenderDirectivesPass([
      new UseDirective(decoder),
      new KeyDirective(decoder),
      new PreRenderStatic(decoder),
    ]);
    this.Render = new FakeRenderPass(decoder);
    this.Postrender = new RenderDirectivesPass([new PostRenderStatic(decoder), new DataDirective(decoder)]);
  }
}
