import { initLogic } from "./suggestions.js";
import { fetchResources, loadData } from "./utils.js";
import { renderIcons, renderEngines, renderSettings } from "./ui.js";
import { applyAllSettings } from "./settings.js";
import { setupGlobalListeners } from "./events.js";

const init = async () => {
  // get the default data
  const DEFAULTS = await fetchResources("defaults");

  // Load icons from json file
  const icons = await fetchResources("icons");

  // Get the search engines from localstorage or default const
  const engines = loadData("searchEngines", DEFAULTS.searchEngines);

  // Get the ssettings from localstorage or default const
  const settings = loadData("settingsOptions", DEFAULTS.settingsOptions);

  // Render the icons in the page
  renderIcons(icons);

  //  Render the search engines in the page
  renderEngines(engines);

  //  Render the settings in the page
  renderSettings(settings, engines, icons);

  // Apply settings to the page element
  applyAllSettings(settings);

  // handle page actions
  setupGlobalListeners(engines, settings);

  // Initialize searching logic
  initLogic();
};

// load and excute and start script afetr page fully load
document.addEventListener("DOMContentLoaded", () => {
  init();
});
