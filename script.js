const shouldFocusOnLoad = localStorage.getItem('focusOnLoad') ?? 'true';

if (shouldFocusOnLoad === 'true') {
  if (location.search !== "?focus") {
    location.search = "?focus";
    throw new Error("Redirecting to focus mode");
  }
}

document.addEventListener('DOMContentLoaded', async () => {

  loadIcons();

  const searchEnginesList = document.querySelector("#search-engines-list");

  let searchEngines = JSON.parse(localStorage.getItem('searchEngines'));

  if (!searchEngines) {
    searchEngines = [
      { key: "startpage", name: "Startpage", url: "https://www.startpage.com/sp/search?q=", visible: true, preferred: true },
      { key: "google", name: "Google", url: "https://www.google.com/search?q=", visible: true, preferred: false },
      { key: "duckduckgo", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=", visible: true, preferred: false },
      { key: "perplexity", name: "Perplexity", url: "https://www.perplexity.ai/search?q=", visible: true, preferred: false },
      { key: "mistral", name: "mistral", url: "https://chat.mistral.ai/chat?q=", visible: false, preferred: false },
      { key: "gemini", name: "gemini", url: "https://www.google.com/search?udm=50&q=", visible: false, preferred: false }
    ];
    localStorage.setItem('searchEngines', JSON.stringify(searchEngines));
  }

  const loadedEnginesFinished = await loadEngines(searchEngines, searchEnginesList);

  if (loadedEnginesFinished) {
    const searchEnginesBtns = document.querySelectorAll("#search-engines-list li button");

    searchEnginesBtns.forEach((btn) => {
      btn.addEventListener("click", () => {

        const clickedKey = btn.dataset.key;

        searchEnginesBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        searchEngines = searchEngines.map(engine => {
          if (engine.key === clickedKey) {
            engine.preferred = true;
          } else {
            engine.preferred = false;
          }
          return engine;
        });

        localStorage.setItem('searchEngines', JSON.stringify(searchEngines));

      });
    });
  }

  const settingsBtn = document.querySelector("#settings-btn");
  const settingsPanel = document.querySelector("#settings-panel");
  const searchInput = document.querySelector("#search-input");

  const handleSettingsToggle = (e) => {
    const isClickOnButton = settingsBtn.contains(e.target);
    const isClickInsidePanel = settingsPanel.contains(e.target);

    if (isClickOnButton) {
      toggleSettingsPanel();
    } else if (!isClickInsidePanel) {
      settingsPanel.classList.add("hidden");
      settingsBtn.classList.remove("hidden");
      updateSettingsButtonAccessibility(settingsBtn);
    }
  };

  const handleSettingsEscape = (e) => {
    if (e.key === 'Escape') {
      settingsPanel.classList.add("hidden");
      settingsBtn.classList.remove("hidden");
      updateSettingsButtonAccessibility(settingsBtn);
    }
  };

  const handleSettingsAls_s = (e) => {
    if (e.altKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      toggleSettingsPanel();
    }
  }

  const toggleSettingsPanel = () => {
    settingsPanel.classList.toggle("hidden");
    settingsBtn.classList.toggle("hidden");
    updateSettingsButtonAccessibility(settingsBtn);
  }

  const focusOnInput = (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  }

  document.addEventListener('click', (e) => handleSettingsToggle(e));
  document.addEventListener('keydown', (e) => {
    handleSettingsEscape(e);
    focusOnInput(e);
    handleSettingsAls_s(e);
  });

  let settingsOptions = JSON.parse(localStorage.getItem('settingsOptions'));
  if (!settingsOptions) {
    settingsOptions = [{ "label": "Focus search bar on new tab", "active": true, "storageKey": "focusOnLoad" }, { "label": "Hide search placeholder", "active": false, "storageKey": "showPlaceholder" }, { "label": "Hide settings icon", "active": false, "storageKey": "alwaysShowSettings" }];
    localStorage.setItem('settingsOptions', JSON.stringify(settingsOptions));
  }

  const loadedSettingsFinished = await loadSettings(settingsOptions);

  const applySetting = (option) => {
    switch (option.storageKey) {
      case "focusOnLoad":
        localStorage.setItem('focusOnLoad', option.active ? true : false);
        break;
      case "showPlaceholder":
        document.querySelector("#search-input").placeholder = option.active ? "" : "Press / to start typing, Alt+S for settings";
        break;
      case "alwaysShowSettings":
        settingsBtn.classList.toggle("disabled", option.active); updateSettingsButtonAccessibility(settingsBtn);
        break;
    }
  };

  if (loadedSettingsFinished) {
    settingsOptions.forEach(applySetting);
    document.querySelectorAll("#settings-options input[type='checkbox']").forEach(input => {
      input.addEventListener("change", () => {
        const option = settingsOptions.find(o => o.storageKey === input.id);
        if (option) {
          option.active = input.checked;
          localStorage.setItem('settingsOptions', JSON.stringify(settingsOptions));
          applySetting(option);
        }
      });
    });
  }

});

const loadIcons = async () => {
  try {
    const response = await fetch('./assets/data/icons.json');
    const icons = await response.json();
    const parser = new DOMParser();

    for (const el of document.querySelectorAll('[data-icon]')) {
      const icon = icons[el.dataset.icon];
      if (icon && icon.content) {
        const svgString = `
          <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            ${icon.content}
          </svg>
        `;
        const doc = parser.parseFromString(svgString, "image/svg+xml");
        el.replaceChildren(doc.documentElement);
      }
    }
  } catch (error) {
    console.error("Failed to load icons:", error);
  }
}

const loadEngines = async (searchEngines, searchEnginesListEl) => {
  try {
    for (let i = 0; i < searchEngines.length; i++) {
      const el = searchEngines[i];

      if (!el.visible) continue;

      const liEL = document.createElement("li");
      const liButtonEl = document.createElement("button");
      liButtonEl.textContent = el.name;
      liButtonEl.dataset.key = el.key;
      liEL.appendChild(liButtonEl);

      if (el.preferred) {
        liButtonEl.classList.add("active");
      }

      if (i != 0) {
        const separationEl = document.createElement('li');
        separationEl.classList.add('inactive');
        separationEl.textContent = "/";
        searchEnginesListEl.appendChild(separationEl);
      }

      searchEnginesListEl.appendChild(liEL);
    }
    return true;
  } catch (error) {
    console.error("Failed to load engines:", error);
    return false;
  }
}

const loadSettings = async (settingsOptions) => {
  try {
    const settingsOptionsContainer = document.querySelector("#settings-options");
    const response = await fetch('./assets/data/icons.json');
    const icons = await response.json();
    const parser = new DOMParser();


    for (let i = 0; i < settingsOptions.length; i++) {
      const option = settingsOptions[i];

      const liEl = document.createElement("li");

      const inputEl = document.createElement("input");
      inputEl.type = "checkbox";
      inputEl.id = option.storageKey;
      inputEl.checked = option.active;

      const labelEl = document.createElement("label");
      labelEl.setAttribute("for", option.storageKey);

      const checkDiv = document.createElement("div");
      checkDiv.classList.add("check");

      const iconData = icons["check"];
      if (iconData && iconData.content) {
        const svgString = `
          <svg width="14" height="14" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            ${iconData.content}
          </svg>
        `;
        const doc = parser.parseFromString(svgString, "image/svg+xml");
        checkDiv.appendChild(doc.documentElement);
      }

      const spanEl = document.createElement("span");
      spanEl.textContent = option.label;

      labelEl.appendChild(checkDiv);
      labelEl.appendChild(spanEl);

      liEl.appendChild(inputEl);
      liEl.appendChild(labelEl);

      settingsOptionsContainer.appendChild(liEl);
    }

    return true;
  } catch (error) {
    console.error("Failed to load settings:", error);
    return false;
  }
};


const updateSettingsButtonAccessibility = (settingsBtn) => {
  if (settingsBtn.classList.contains("hidden") || settingsBtn.classList.contains("disabled")) {
    settingsBtn.setAttribute("aria-hidden", "true");
    settingsBtn.setAttribute("tabindex", "-1");
  } else {
    settingsBtn.removeAttribute("aria-hidden");
    settingsBtn.removeAttribute("tabindex");
  }
};
