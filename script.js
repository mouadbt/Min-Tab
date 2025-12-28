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
      settingsPanel.classList.toggle("hidden");
      settingsBtn.classList.toggle("hidden");
    } else if (!isClickInsidePanel) {
      settingsPanel.classList.add("hidden");
      settingsBtn.classList.remove("hidden");
    }
  };

  const handleSettingsEscape = (e) => {
    if (e.key === 'Escape') {
      settingsPanel.classList.add("hidden");
      settingsBtn.classList.remove("hidden");
    }
  };

  const focusOnInput = (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  }

  document.addEventListener('click', (e) => handleSettingsToggle(e));
  document.addEventListener('keydown', (e) => { handleSettingsEscape(e); focusOnInput(e); });

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