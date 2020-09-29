import { isObject } from '@app/helpers/helpers';
export interface SettingsWithDefinitions {
  definitions: {
    [k: string]: unknown;
  };
}
export function isSettingsWithDefinitions(v: Settings): v is SettingsWithDefinitions {
  return typeof v['definitions'] === 'object' && v['definitions'] !== null;
}

export interface SettingsWithData {
  data: {
    [k: string]: unknown;
  };
}

export function isSettingsWithData(v: Settings): v is SettingsWithData {
  return typeof v['data'] === 'object' && v['data'] !== null;
}

export interface Settings extends Partial<SettingsWithData>, Partial<SettingsWithDefinitions> {
  root?: boolean;
}

export function isSettings(v: unknown): v is Settings {
  return isObject(v);
}
