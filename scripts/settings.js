import { saveData, switchToLightMode, focusOnSearchInput } from './utils.js';
import { renderEngines } from './ui.js';



// apply the settings to the page and behavior
export const applySystemSetting = (key, isActive) => {
  switch (key) {
    case 'focusOnLoad':
      isActive && focusOnSearchInput(document.querySelector("#search-input"));
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

    case 'hideSearchLogo':
      document.querySelector('#searchIcon')
        .classList.toggle('hidden', isActive);
      break;

    case 'lightmode':
      switchToLightMode(isActive);
      break;

    default:
      // no-op
      break;
  }
}

// Apply the settings to the page on load and on settings change
export const applyAllSettings = (settings) => {
  settings.forEach(s => applySystemSetting(s.key, s.active));
}

// Update the search engines list to set the selected engine as preferred and ensure it's active
export const handleEngineSelect = (key, engines) => {
  // Find the engine that was clicked
  const clickedEngine = engines.find(e => e.key === key);

  // If the clicked engine is not active (not checked in settings), make it active
  if (clickedEngine && !clickedEngine.active) {
    clickedEngine.active = true;
  }

  // Set the clicked engine as preferred (active in the UI)
  const updated = engines.map(e => ({
    ...e,
    preferred: e.key === key,
    active: e.key === key ? true : e.active // Ensure the selected engine is active
  }));

  saveData('searchEngines', updated);
  renderEngines(updated);
}

// update the new settings applied by user in the localstorage and in the page 
export const handleSettingChange = (key, isActive, settings) => {
  const option = settings.find(s => s.key === key);
  if (option) {
    option.active = isActive;
    saveData('settingsOptions', settings);
    applySystemSetting(key, isActive);
  }
}

// update the new search engine settings applied by user in the localstorage and in the page
export const handleEngineSettingChange = (key, isActive, engines) => {
  const engine = engines.find(e => e.key === key);
  if (engine) {
    engine.active = isActive;

    // If the engine is being activated (checked) and there's no preferred engine or this engine is being activated,
    // make it the preferred engine as well
    if (isActive) {
      // Check if there's no currently preferred engine, or if user is activating an engine
      const currentPreferred = engines.find(e => e.preferred);

      // If no engine is currently preferred OR the activated engine is not the current preferred one,
      // make the activated engine the preferred one
      if (!currentPreferred || currentPreferred.key !== key) {
        // Set all engines as not preferred first
        engines.forEach(e => e.preferred = false);
        // Then set the activated engine as preferred
        engine.preferred = true;
      }
    }
    saveData('searchEngines', engines);
    renderEngines(engines);
  }
}