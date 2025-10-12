import {realm} from "./db";

export function getSettings() {
  return realm.objects("Settings")[0];
}

export function updateSettings(newSettings) {
  const settings = getSettings();
  if (!settings) return;

  realm.write(() => {
    Object.keys(newSettings).forEach((key) => {
      settings[key] = newSettings[key];
    });
  });
}
