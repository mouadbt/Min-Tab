import { closeSettingsPanel, toggleSettings } from './ui.js';
import { handleEngineSelect, handleSettingChange, handleEngineSettingChange } from './settings.js';
import { navigateBetweenSuggestions } from './keyboardNavigation.js';
import { performSearch } from './search.js';
export const setupGlobalListeners = (engines, settings) => {

    const settingsBtnpanel = document.querySelector("#settings-panel");
    const settingsBtn = document.querySelector("#settings-btn");
    const searchBtn = document.querySelector("#search-btn");
    const searchInput = document.querySelector("#search-input");
    const scrollContainer = document.getElementById("search-engines-list");

    document.addEventListener('keydown', (e) => {

        // Close settings panel
        if (e.key === 'Escape') {
            closeSettingsPanel(settingsBtnpanel, settingsBtn);
        };

        // Toggle settings panel
        if (e.altKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            toggleSettings(settingsBtnpanel, settingsBtn);
        };

        // Focus on the search input 
        if (e.key === '/' && document.activeElement.id !== "search-input") {
            e.preventDefault();
            searchInput.focus();
        };

        // navigate between search suggestions using keyboard
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            navigateBetweenSuggestions(e, searchInput, suggestionsList, searchBtn);
        };

        // perform search
        if (e.key === 'Enter' && e.target === searchInput) {
            const query = e.target.value.trim().toLowerCase();
            performSearch(query, engines);
        };

    });

    // perform search when the search button is clicked
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim().toLowerCase();
        performSearch(query, engines);
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

    // show loading icon in the clicked search suggestion
    suggestionsList.addEventListener("click", (e) => {
        const link = e.target.closest(".suggestion-link");
        if (!link) return;
        link.classList.add("loading"); // show loading icon
    });

    // make user able to scroll horizontally throw the search egnines by moving the cursor wheel
    scrollContainer.addEventListener("wheel", (evt) => {
        evt.preventDefault();
        scrollContainer.scrollLeft += evt.deltaY;
    });
};