import { saveData } from './utils.js';
import { renderEngines } from './ui.js';

// Focus the cursor on the search input and override the browser's default behavior of focusing the address bar
const focusOnSearchInputInsteadOfBrowserAddressBar = (inputEl) => {
  inputEl.focus();
  if (location.search !== "?focus") {
    location.search = "?focus";
    throw new Error("Redirecting to focus mode");
  }
};

// apply the settings to the page and behavior
export const applySystemSetting = (key, isActive) => {
  switch (key) {
    case 'focusOnLoad':
      isActive && focusOnSearchInputInsteadOfBrowserAddressBar(document.querySelector("#search-input"));
      break;

    case 'showPlaceholder':
      document.querySelector('#search-input').placeholder =
        isActive ? '' : '/ to start typing, alt+s for settings';
      break;

    case 'hideSettingsButton':
      document.querySelector('#settings-btn')
        .classList.toggle('hidden', isActive);
      break;

    case 'hideEngines':
      document.querySelector('#search-engines-list')
        .classList.toggle('hidden', isActive);
      break;

    case 'hideSearchButton':
      document.querySelector('#search-btn')
        .classList.toggle('disabled', isActive);
      break;

    default:
      // no-op
      break;
  }
};

// Apply the settings to the page on load and on settings change
export const applyAllSettings = (settings) => {
  settings.forEach(s => applySystemSetting(s.key, s.active));
};

// Update the search engines list to set the active one to be the one that user clicked on 
export const handleEngineSelect = (key, engines) => {
  const updated = engines.map(e => ({ ...e, preferred: e.key === key }));
  saveData('searchEngines', updated);
  renderEngines(updated);
};

// update the new settings applied by user in the localstorage and in the page 
export const handleSettingChange = (key, isActive, settings) => {
  const option = settings.find(s => s.key === key);
  if (option) {
    option.active = isActive;
    saveData('settingsOptions', settings);
    applySystemSetting(key, isActive);
  }
};

// update the new search engine settings applied by user in the localstorage and in the page 
export const handleEngineSettingChange = (key, isActive, engines) => {
  const engine = engines.find(e => e.key === key);
  if (engine) {
    engine.active = isActive;
    saveData('searchEngines', engines);
    renderEngines(engines);
  }
};