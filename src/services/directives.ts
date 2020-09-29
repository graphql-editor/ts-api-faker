import { isSettingsWithData, isSettingsWithDefinitions, Settings } from './settings';

const indexPathRe = /\[\d+\]/g;

export const DirectivePrefix = '@';

type IsDirFunc = (data: string, dir: string) => boolean;

function isDir(data: string, dir: string): boolean {
  return DirectivePrefix + dir === data || data.startsWith(DirectivePrefix + dir + ':');
}

function removeDir(data: string, dir: string, isDirCheck?: IsDirFunc): string {
  isDirCheck = isDirCheck || isDir;
  if (isDirCheck(data, dir)) {
    data = data.slice(dir.length + 2);
  }
  return data;
}

function followPath(data: string, v: object): unknown {
  if (!v) {
    return v;
  }
  if (data.indexOf('.') === -1) {
    return v[data];
  }
  const k = data.slice(0, data.indexOf('.'));
  data = data.slice(data.indexOf('.') + 1);
  return followPath(data, v[k]);
}

export interface Directive {
  name: string;
  apply(value: unknown, settings: Settings, path: string, passContext: object): unknown;
  isDir?: IsDirFunc;
}

export interface Decoder {
  (v: string): unknown;
}

abstract class BaseDirective {
  public isDir?: IsDirFunc;
  constructor(public name: string, public decoder: Decoder) {}
  apply(value: string, settings: Settings, path: string, passContext: object): unknown {
    const isDirCheck = this.isDir || isDir;
    return isDirCheck(value, this.name) ? this.value(value, settings, path, passContext) : value;
  }
  abstract value(value: string, settings: object, path: string, passContext: object): unknown;
}

export class DataDirective extends BaseDirective {
  constructor(decoder: Decoder) {
    super('data', decoder);
  }
  value(value: string, settings: Settings): unknown {
    return isSettingsWithData(settings) ? followPath(removeDir(value, this.name), settings.data) : value;
  }
}

export class PreRenderStatic extends BaseDirective {
  constructor(decoder: Decoder) {
    super('static', decoder);
  }
  value(value: string, _: Settings, path: string, context: object): unknown {
    const id = path.replace(indexPathRe, '[]');
    if (!context[id]) {
      context[id] = this.decoder(removeDir(value, this.name));
    }
    return '@static:' + context[id];
  }
}

export class PostRenderStatic extends BaseDirective {
  constructor(decoder: Decoder) {
    super('static', decoder);
  }
  value(value: string): unknown {
    return value.slice('@static:'.length);
  }
}

export class UseDirective extends BaseDirective {
  constructor(decoder: Decoder) {
    super('use', decoder);
  }
  value(value: string, settings: Settings): unknown {
    return isSettingsWithDefinitions(settings) ? followPath(removeDir(value, this.name), settings.definitions) : value;
  }
}

export class KeyDirective extends BaseDirective {
  constructor(decoder: Decoder) {
    super('key', decoder);
  }
  value(_1: string, _2: Settings, path: string): unknown {
    return path.slice(path.lastIndexOf('.') + 1).replace(indexPathRe, '');
  }
}
