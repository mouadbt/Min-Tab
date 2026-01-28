// Embed the svg icon to the page  
export const buildTheSvgIcon = (svgIconContent, btn, withDimensions) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  if (withDimensions) {
    svg.setAttribute("width", "20px");
    svg.setAttribute("height", "20px");
  }
  svg.innerHTML += svgIconContent;
  btn.appendChild(svg);
};

// Render the icons in the relevant button
export const renderIcons = (icons) => {
  document.querySelectorAll('.icon-btn').forEach((btn) => {
    const svgIconContent = icons[btn.dataset.icon]?.content;
    btn.innerHTML = '';
    buildTheSvgIcon(svgIconContent, btn);
  });
};

// Render the search engines in the page
export const renderEngines = (engines) => {
  const searchEnginesList = document.querySelector("#search-engines-list");
  //  Clear the container of search engines because this function is called on load and on update of the search engines selection / delegation
  searchEnginesList.innerHTML = '';
  engines.filter((el) => el.active === true).forEach((el, i) => {
    const liEL = document.createElement("li");
    const liButtonEl = document.createElement("button");
    liButtonEl.textContent = el.label;
    liButtonEl.dataset.key = el.key;
    liEL.appendChild(liButtonEl);

    if (el.preferred) {
      liButtonEl.classList.add("active");
      renderPreferedEngineIcon(el.key);
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

// Render icon of the active prefered search engine
const renderPreferedEngineIcon = (key) => {
  const iconEl = document.querySelector("#searchIcon");
  const icon = document.createElement('img');
  icon.src = `./assets/images/searchLogos/${key}.webp`;
  iconEl.innerHTML = '';
  iconEl.appendChild(icon);
}

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

// render the settings options & search engines in the settings panel
export const renderSettings = (settings, engines, icons) => {
  const settingsContainer = document.querySelector("#settings-options");
  const enginesContainer = document.querySelector("#settings-search-engines");

  // render settings options
  settings.forEach(option => createOptionElement(option, icons, settingsContainer));

  // render search engines
  engines.forEach(option => createOptionElement(option, icons, enginesContainer));
};

// Disable settings button completely
const updateSettingsButtonAccessibility = (settingsBtn) => {
  if (settingsBtn.classList.contains("disabled")) {
    settingsBtn.setAttribute("tabindex", "-1");
  } else {
    settingsBtn.removeAttribute("tabindex");
  }
};

// Settings panel helper functions
export const closeSettingsPanel = (settingspanel, settingsBtn) => {
  settingspanel.classList.add("hidden");
  settingsBtn.classList.remove("disabled");
  updateSettingsButtonAccessibility(settingsBtn);
};

// Toggle settings panel
export const toggleSettings = (settingspanel, settingsBtn) => {
  settingspanel.classList.toggle("hidden");
  settingsBtn.classList.toggle("disabled");
  updateSettingsButtonAccessibility(settingsBtn);
};