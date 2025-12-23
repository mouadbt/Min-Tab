document.addEventListener('DOMContentLoaded', () => {

  loadIcons();

});

// Function that get all icons and load them in the page using createElement
async function loadIcons() {
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