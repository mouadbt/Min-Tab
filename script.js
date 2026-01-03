// const shouldFocusOnLoad = localStorage.getItem('focusOnLoad') ?? 'true';

// if (shouldFocusOnLoad === 'true') {
//   if (location.search !== "?focus") {
//     location.search = "?focus";
//     throw new Error("Redirecting to focus mode");
//   }
// }

// document.addEventListener('DOMContentLoaded', async () => {

//   loadIcons();

//   const searchEnginesList = document.querySelector("#search-engines-list");

//   let searchEngines = JSON.parse(localStorage.getItem('searchEngines'));

//   if (!searchEngines) {
//     searchEngines = [
//       { key: "startpage", name: "Startpage", url: "https://www.startpage.com/sp/search?q=", visible: true, preferred: true },
//       { key: "google", name: "Google", url: "https://www.google.com/search?q=", visible: true, preferred: false },
//       { key: "duckduckgo", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=", visible: true, preferred: false },
//       { key: "perplexity", name: "Perplexity", url: "https://www.perplexity.ai/search?q=", visible: true, preferred: false },
//       { key: "mistral", name: "mistral", url: "https://chat.mistral.ai/chat?q=", visible: false, preferred: false },
//       { key: "gemini", name: "gemini", url: "https://www.google.com/search?udm=50&q=", visible: false, preferred: false }
//     ];
//     localStorage.setItem('searchEngines', JSON.stringify(searchEngines));
//   }

//   const loadedEnginesFinished = await loadEngines(searchEngines, searchEnginesList);

//   if (loadedEnginesFinished) {
//     const searchEnginesBtns = document.querySelectorAll("#search-engines-list li button");

//     searchEnginesBtns.forEach((btn) => {
//       btn.addEventListener("click", () => {

//         const clickedKey = btn.dataset.key;

//         searchEnginesBtns.forEach(b => b.classList.remove("active"));
//         btn.classList.add("active");

//         searchEngines = searchEngines.map(engine => {
//           if (engine.key === clickedKey) {
//             engine.preferred = true;
//           } else {
//             engine.preferred = false;
//           }
//           return engine;
//         });

//         localStorage.setItem('searchEngines', JSON.stringify(searchEngines));

//       });
//     });
//   }

//   const settingsBtn = document.querySelector("#settings-btn");
//   const settingsPanel = document.querySelector("#settings-panel");
//   const searchInput = document.querySelector("#search-input");

//   const handleSettingsToggle = (e) => {
//     const isClickOnButton = settingsBtn.contains(e.target);
//     const isClickInsidePanel = settingsPanel.contains(e.target);

//     if (isClickOnButton) {
//       toggleSettingsPanel();
//     } else if (!isClickInsidePanel) {
//       settingsPanel.classList.add("hidden");
//       settingsBtn.classList.remove("hidden");
//       updateSettingsButtonAccessibility(settingsBtn);
//     }
//   };

//   const handleSettingsEscape = (e) => {
//     if (e.key === 'Escape') {
//       settingsPanel.classList.add("hidden");
//       settingsBtn.classList.remove("hidden");
//       updateSettingsButtonAccessibility(settingsBtn);
//     }
//   };

//   const handleSettingsAls_s = (e) => {
//     if (e.altKey && e.key.toLowerCase() === 's') {
//       e.preventDefault();
//       toggleSettingsPanel();
//     }
//   }

//   const toggleSettingsPanel = () => {
//     settingsPanel.classList.toggle("hidden");
//     settingsBtn.classList.toggle("hidden");
//     updateSettingsButtonAccessibility(settingsBtn);
//   }

//   const focusOnInput = (e) => {
//     if (e.key === '/' && document.activeElement !== searchInput) {
//       e.preventDefault();
//       searchInput.focus();
//     }
//   }

//   document.addEventListener('click', (e) => handleSettingsToggle(e));
//   document.addEventListener('keydown', (e) => {
//     handleSettingsEscape(e);
//     focusOnInput(e);
//     handleSettingsAls_s(e);
//   });

//   let settingsOptions = JSON.parse(localStorage.getItem('settingsOptions'));
//   if (!settingsOptions) {
//     settingsOptions = [{ "label": "Focus search bar on new tab", "active": true, "key": "focusOnLoad" }, { "label": "Hide search placeholder", "active": false, "key": "showPlaceholder" }, { "label": "Hide settings icon", "active": false, "key": "alwaysShowSettings" }];
//     localStorage.setItem('settingsOptions', JSON.stringify(settingsOptions));
//   }

//   const loadedSettingsFinished = await loadSettings(settingsOptions);

//   const applySetting = (option) => {
//     switch (option.key) {
//       case "focusOnLoad":
//         localStorage.setItem('focusOnLoad', option.active ? true : false);
//         break;
//       case "showPlaceholder":
//         document.querySelector("#search-input").placeholder = option.active ? "" : "Press / to start typing, Alt+S for settings";
//         break;
//       case "alwaysShowSettings":
//         settingsBtn.classList.toggle("disabled", option.active); updateSettingsButtonAccessibility(settingsBtn);
//         break;
//     }
//   };

//   if (loadedSettingsFinished) {
//     settingsOptions.forEach(applySetting);
//     document.querySelectorAll("#settings-options input[type='checkbox']").forEach(input => {
//       input.addEventListener("change", () => {
//         const option = settingsOptions.find(o => o.key === input.id);
//         if (option) {
//           option.active = input.checked;
//           localStorage.setItem('settingsOptions', JSON.stringify(settingsOptions));
//           applySetting(option);
//         }
//       });
//     });
//   }

// });

// const loadIcons = async () => {
//   try {
//     const response = await fetch('./assets/data/icons.json');
//     const icons = await response.json();
//     const parser = new DOMParser();

//     for (const el of document.querySelectorAll('[data-icon]')) {
//       const icon = icons[el.dataset.icon];
//       if (icon && icon.content) {
//         const svgString = `
//           <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
//             ${icon.content}
//           </svg>
//         `;
//         const doc = parser.parseFromString(svgString, "image/svg+xml");
//         el.replaceChildren(doc.documentElement);
//       }
//     }
//   } catch (error) {
//     console.error("Failed to load icons:", error);
//   }
// }

// const loadEngines = async (searchEngines, searchEnginesListEl) => {
//   try {
//     for (let i = 0; i < searchEngines.length; i++) {
//       const el = searchEngines[i];

//       if (!el.visible) continue;

//       const liEL = document.createElement("li");
//       const liButtonEl = document.createElement("button");
//       liButtonEl.textContent = el.name;
//       liButtonEl.dataset.key = el.key;
//       liEL.appendChild(liButtonEl);

//       if (el.preferred) {
//         liButtonEl.classList.add("active");
//       }

//       if (i != 0) {
//         const separationEl = document.createElement('li');
//         separationEl.classList.add('inactive');
//         separationEl.textContent = "/";
//         searchEnginesListEl.appendChild(separationEl);
//       }

//       searchEnginesListEl.appendChild(liEL);
//     }
//     return true;
//   } catch (error) {
//     console.error("Failed to load engines:", error);
//     return false;
//   }
// }

// const loadSettings = async (settingsOptions) => {
//   try {
//     const settingsOptionsContainer = document.querySelector("#settings-options");
//     const response = await fetch('./assets/data/icons.json');
//     const icons = await response.json();
//     const parser = new DOMParser();


//     for (let i = 0; i < settingsOptions.length; i++) {
//       const option = settingsOptions[i];

//       const liEl = document.createElement("li");

//       const inputEl = document.createElement("input");
//       inputEl.type = "checkbox";
//       inputEl.id = option.key;
//       inputEl.checked = option.active;

//       const labelEl = document.createElement("label");
//       labelEl.setAttribute("for", option.key);

//       const checkDiv = document.createElement("div");
//       checkDiv.classList.add("check");

//       const iconData = icons["check"];
//       if (iconData && iconData.content) {
//         const svgString = `
//           <svg width="14" height="14" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
//             ${iconData.content}
//           </svg>
//         `;
//         const doc = parser.parseFromString(svgString, "image/svg+xml");
//         checkDiv.appendChild(doc.documentElement);
//       }

//       const spanEl = document.createElement("span");
//       spanEl.textContent = option.label;

//       labelEl.appendChild(checkDiv);
//       labelEl.appendChild(spanEl);

//       liEl.appendChild(inputEl);
//       liEl.appendChild(labelEl);

//       settingsOptionsContainer.appendChild(liEl);
//     }

//     return true;
//   } catch (error) {
//     console.error("Failed to load settings:", error);
//     return false;
//   }
// };


// const updateSettingsButtonAccessibility = (settingsBtn) => {
//   if (settingsBtn.classList.contains("hidden") || settingsBtn.classList.contains("disabled")) {
//     settingsBtn.setAttribute("aria-hidden", "true");
//     settingsBtn.setAttribute("tabindex", "-1");
//   } else {
//     settingsBtn.removeAttribute("aria-hidden");
//     settingsBtn.removeAttribute("tabindex");
//   }
// };






















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
  setupGlobalListeners(engines);
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
  svg.innerHTML = svgIconContent;
  btn.appendChild(svg);
};

// Render the search engines in the page
const renderEngines = (engines) => {
  const searchEnginesList = document.querySelector("#search-engines-list");
  //  Clear the container of seach engines because this fucntion is called on laod and on update of the search engines selection / delegation
  searchEnginesList.innerHTML = '';
  engines.filter((el) => el.active === true).map((el, i) => {
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
  const settingsOptionsContainer = document.querySelector("#settings-options");
  const settingsOptions = [...settings, { separator: true }, ...engines];
  console.log(settingsOptions)
  settingsOptions.forEach((option) => {

    if (option?.separator) {
      renderSettingsSeparator(settingsOptionsContainer);
      return;
    }

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

    settingsOptionsContainer.appendChild(liEl);

  });

};

const renderSettingsSeparator = (settingsOptionsContainer) => {
  const liEl = document.createElement("li");
  const divEl = document.createElement("dev");
  divEl.setAttribute("id", "settingsSeparator");
  liEl.appendChild(divEl);
  settingsOptionsContainer.appendChild(liEl);
}

const applyAllSettings = () => {
  return true;
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

const setupGlobalListeners = (engines) => {

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
    if (e.key === '/' && document.activeElement.id !== "search-input") e.preventDefault() || document.querySelector("#search-input").focus();

  });

  // Open settings panel
  settingsBtn.addEventListener('click', () => {
    toggleSettings(settingsBtnpanel, settingsBtn)
  });

  // Close settings panel when clicking outside
  document.addEventListener('click', (e) => {
    if (!settingsBtnpanel.contains(e.target) && !settingsBtn.contains(e.target)) {
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

};
