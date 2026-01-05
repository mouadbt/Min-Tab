const init = async () => {

  // get the default data
  const DEFAULTS = await fetchResources('defaults');

  // Load icons from json file
  const icons = await fetchResources('icons');

  // Get the search engines from localstorage or default const
  const engines = loadData('searchEngines', DEFAULTS.searchEngines);

  // Get the ssettings from localstorage or default const
  const settings = loadData('settingsOptions', DEFAULTS.settingsOptions);

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
};

// load and excute and start script afetr page fully load
document.addEventListener("DOMContentLoaded", () => {
  init();
});

// Help fucntion to get data from resources
const fetchResources = async (key) => {
  try {
    const res = await fetch(`./assets/data/${key}.json`);
    if (!res.ok) throw new Error(`Failed to fetch ${key}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

// get the defaults data from the localstorage or the default
const loadData = (key, defaults) => {
  const raw = localStorage.getItem(key);
  try {
    return raw ? JSON.parse(raw) : defaults;
  } catch {
    return defaults;
  }
};

// Store updated data in localstorage
const saveData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Render the icons in the relevent button
const renderIcons = (icons) => {
  document.querySelectorAll('.icon-btn').forEach((btn) => {
    const svgIconContent = icons[btn.dataset.icon]?.content;
    btn.innerHTML = '';
    buildTheSvgIcon(svgIconContent, btn);
  });
};

// Embed the the svg icon to the page  
const buildTheSvgIcon = (svgIconContent, btn, withDimensions) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  if (withDimensions) {
    svg.setAttribute("width", "20px");
    svg.setAttribute("height", "20px");
  }
  svg.innerHTML += svgIconContent;
  btn.appendChild(svg);
};

// Render the search engines in the page
const renderEngines = (engines) => {
  const searchEnginesList = document.querySelector("#search-engines-list");
  //  Clear the container of seach engines because this fucntion is called on laod and on update of the search engines selection / delegation
  searchEnginesList.innerHTML = '';
  engines.filter((el) => el.active === true).forEach((el, i) => {
    const liEL = document.createElement("li");
    const liButtonEl = document.createElement("button");
    liButtonEl.textContent = el.label;
    liButtonEl.dataset.key = el.key;
    liEL.appendChild(liButtonEl);

    if (el.preferred) {
      liButtonEl.classList.add("active");
    }

    if (i != 0) {
      const separationEl = document.createElement('li');
      separationEl.classList.add('inactive');
      separationEl.textContent = "/";
      searchEnginesList.appendChild(separationEl);
    }

    searchEnginesList.appendChild(liEL);
  });
};

// Update the search engines list to set the active one to be the one that user clicked on 
const handleEngineSelect = (key, engines) => {
  const updated = engines.map(e => ({ ...e, preferred: e.key === key }));
  saveData('searchEngines', updated);
  renderEngines(updated);
};

// render the settings options & search engines in the settings panel
const renderSettings = (settings, engines, icons) => {
  const settingsContainer = document.querySelector("#settings-options");
  const enginesContainer = document.querySelector("#settings-search-engines");

  // render settings options
  settings.forEach(option => createOptionElement(option, icons, settingsContainer));

  // render search engines
  engines.forEach(option => createOptionElement(option, icons, enginesContainer));
};

// helper to create & append a single option
const createOptionElement = (option, icons, container) => {

  const liEl = document.createElement("li");

  const inputEl = document.createElement("input");
  inputEl.type = "checkbox";
  inputEl.id = option.key;
  inputEl.checked = option.active;

  const labelEl = document.createElement("label");
  labelEl.setAttribute("for", option.key);

  const checkDiv = document.createElement("div");
  checkDiv.classList.add("check");

  const iconData = icons["check"];
  if (iconData && iconData.content) {
    buildTheSvgIcon(iconData.content, checkDiv, true);
  }

  const spanEl = document.createElement("span");
  spanEl.textContent = option.label;

  labelEl.appendChild(checkDiv);
  labelEl.appendChild(spanEl);

  liEl.appendChild(inputEl);
  liEl.appendChild(labelEl);

  container.appendChild(liEl);
};

// Settings panel helper functions
const closeSettingsPanel = (settingsBtnpanel, settingsBtn) => {
  settingsBtnpanel.classList.add("hidden");
  settingsBtn.classList.remove("disabled");
  updateSettingsButtonAccessibility(settingsBtn);
};

// Toggle settings panel
const toggleSettings = (settingsBtnpanel, settingsBtn) => {
  settingsBtnpanel.classList.toggle("hidden");
  settingsBtn.classList.toggle("disabled");
  updateSettingsButtonAccessibility(settingsBtn);
};

// Disable settings button completely
const updateSettingsButtonAccessibility = (settingsBtn) => {
  if (settingsBtn.classList.contains("disabled")) {
    settingsBtn.setAttribute("tabindex", "-1");
  } else {
    settingsBtn.removeAttribute("tabindex");
  }
};

// update the new settings applied by user in the localstorage and in the page 
const handleSettingChange = (key, isActive, settings) => {
  const option = settings.find(s => s.key === key);
  if (option) {
    option.active = isActive;
    saveData('settingsOptions', settings);
    applySystemSetting(key, isActive);
  }
};

// Apply the settings to the page on load and on settings change
const applyAllSettings = (settings) => {
  settings.forEach(s => applySystemSetting(s.key, s.active));
};

// Focus the cursor on the search input and override the browser's default behavior of focusing the address bar
const focusOnSearchInputInsteadOfBrowserAddressBar = (inputEl) => {
  inputEl.focus();
  if (location.search !== "?focus") {
    location.search = "?focus";
    throw new Error("Redirecting to focus mode");
  }
};

// apply the settings to the page and behavior
const applySystemSetting = (key, isActive) => {
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

// update the new search engine settings applied by user in the localstorage and in the page 
const handleEngineSettingChange = (key, isActive, engines) => {
  const engine = engines.find(e => e.key === key);
  if (engine) {
    engine.active = isActive;
    saveData('searchEngines', engines);
    renderEngines(engines);
  }
};


const setupGlobalListeners = (engines, settings) => {

  const settingsBtnpanel = document.querySelector("#settings-panel");
  const settingsBtn = document.querySelector("#settings-btn");

  document.addEventListener('keydown', (e) => {

    // Close settings panel
    if (e.key === 'Escape') {
      closeSettingsPanel(settingsBtnpanel, settingsBtn);
    }

    // Toggle settings panel
    if (e.altKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      toggleSettings(settingsBtnpanel, settingsBtn);
    };

    // Focus on the search input 
    if (e.key === '/' && document.activeElement.id !== "search-input") {
      e.preventDefault();
      document.querySelector("#search-input").focus();
    }

  });

  // Open settings panel
  settingsBtn.addEventListener('click', () => {
    toggleSettings(settingsBtnpanel, settingsBtn)
  });

  // Close settings panel when clicking outside
  document.addEventListener('click', (e) => {
    if (!settingsBtnpanel.contains(e.target) && !settingsBtn.contains(e.target) && !settingsBtnpanel.classList.contains("hidden")) {
      closeSettingsPanel(settingsBtnpanel, settingsBtn);
    }
  });

  // Search engine selection / delegation
  document.querySelector("#search-engines-list").addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) {
      handleEngineSelect(btn.dataset.key, engines)
    };
  });

  // ------ handle changes in settings panel and search engines
  // settings and search engines change handlers
  const delegatedSettings = [
    {
      container: "#settings-options",
      callback: handleSettingChange,
      store: settings
    },
    {
      container: "#settings-search-engines",
      callback: handleEngineSettingChange,
      store: engines
    }
  ];

  // attach listeners to each container
  delegatedSettings.forEach(({ container, callback, store }) => {
    const el = document.querySelector(container);
    if (!el) return;
    el.addEventListener('change', (e) => {
      if (e.target.tagName === 'INPUT') {
        callback(e.target.id, e.target.checked, store);
      }
    });
  });

  // Add loading class to the clicked search suggestion to show loading icon
  const suggestionsList = document.querySelector("#suggestions-list");

  suggestionsList.addEventListener("click", (e) => {
    const link = e.target.closest(".suggestion-link");
    if (!link) return;
    link.classList.add("loading"); // show loading icon
  });

};
