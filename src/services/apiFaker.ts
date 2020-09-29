import { isObject } from '@app/helpers/helpers';

import { isSettings, Settings } from './settings';
import { Renderer } from './render';

function bootstrapSettings(settings: Settings, renderer: Renderer): Settings {
  let newSettings: unknown = { ...settings };
  newSettings = renderer.Bootstrap.apply(newSettings, settings);
  return isSettings(newSettings) ? newSettings : settings;
}

export function createResponse(parsedReq: string): string {
  let preparedData: unknown = JSON.parse(parsedReq);
  const renderer = new Renderer();
  const settings: Settings = bootstrapSettings(
    (isObject(preparedData) && isSettings(preparedData['@settings']) && preparedData['@settings']) || {},
    renderer,
  );
  if (isObject(preparedData)) {
    delete preparedData['@settings'];
    if (settings.root) {
      preparedData = preparedData[Object.keys(preparedData)[0]];
    }
  }
  preparedData = renderer.Bootstrap.apply(preparedData, settings);
  preparedData = renderer.Prerender.apply(preparedData, settings);
  preparedData = renderer.Render.apply(preparedData, settings);
  preparedData = renderer.Postrender.apply(preparedData, settings);
  return JSON.stringify(preparedData);
}
