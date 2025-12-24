document.addEventListener('DOMContentLoaded', () => {

  // Add svg icons to the page
  loadIcons();

  // Select DOM elements related to the settings panel
  const settingsBtn = document.querySelector("#settings-btn");
  const settingsPanel = document.querySelector("#settings-panel");

  // Function that checks the click target and toggles the settings panel visibility
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

  // Function that closes the settings panel when the Escape key is pressed
  const handleSettingsEscape = (e) => {
    if (e.key === 'Escape') {
      settingsPanel.classList.add("hidden");
      settingsBtn.classList.remove("hidden");
    }
  };

  // Global event listener for click events
  document.addEventListener('click', (e) => {
    handleSettingsToggle(e);
  });

  // Global event listener for keydown events
  document.addEventListener('keydown', (e) => {
    handleSettingsEscape(e);
  });

});

// Function that gets all icons from JSON and injects them into the page using DOMParser
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