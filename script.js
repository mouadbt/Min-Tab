// Ensures the search input is automatically focused when a new tab is opened.
// This is achieved by reloading the page once with a "?focus" URL parameter.
// The error is thrown to prevent the rest of the script from executing on the initial page load, before the reload occurs.
const shouldFocusOnLoad = localStorage.getItem('focusOnLoad') === null ? true : localStorage.getItem('focusOnLoad') === 'true';

if (shouldFocusOnLoad) {
    if (location.search !== "?focus") {
        location.search = "?focus";
        throw new Error("Redirecting to focus mode");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const searchEnginesNav = document.getElementById("search-engines");
    const searchForm = document.querySelector("form");
    const settingsTrigger = document.querySelector(".setting-trigger button");
    const settingsTriggerContainer = document.querySelector(".setting-trigger");
    const searchInput = document.querySelector("#search-input");
    const searchBtn = document.querySelector("#search-icon");
    const suggestionsList = document.getElementById("suggestions");
    const settingsPanel = document.getElementById("settings-panel");
    const engineSettings = document.getElementById("engine-settings");
    const focusOnLoadCheckbox = document.getElementById("focus-on-load");
    const hidePlaceholderCheckbox = document.getElementById("hide-placeholder");
    const alwaysShowSettingsCheckbox = document.getElementById("always-show-settings");
    const pinnerSvg = `
        <svg class="loadingSVG" viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3V6M3 12H6M5.63607 5.63604L7.75739 7.75736M5.63604 18.3639L7.75736 16.2426M21 12.0005H18M18.364 5.63639L16.2427 7.75771M11.9998 21.0002V18.0002M18.3639 18.3642L16.2426 16.2429" stroke-width="2" stroke="white" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>`;
    // --- State ---
    let lastEnterPressTime = 0;
    let currentSearchUrl = 'https://www.startpage.com/sp/search?q=';
    let currentQuery = '';
    // Delay window used to detect a double Enter press on engine buttons
    const DOUBLE_PRESS_DELAY_MS = 350;


    // --- Settings panel controls ---
    /** @type {{key:string,name:string,url:string,visible:boolean}[]} */
    let engines = [];
    let activeEngineKey = localStorage.getItem('activeEngine') || 'startpage';

    // Set the initial state of the checkboxes from localStorage
    focusOnLoadCheckbox.checked = shouldFocusOnLoad;
    const defaultPlaceholder = searchInput.getAttribute('placeholder') || '';
    const hidePlaceholder = localStorage.getItem('hidePlaceholder') === 'true';
    hidePlaceholderCheckbox.checked = hidePlaceholder;
    const alwaysShowSettings = localStorage.getItem('alwaysShowSettings') === 'true';
    if (alwaysShowSettingsCheckbox) alwaysShowSettingsCheckbox.checked = alwaysShowSettings;

    // Apply hide/show placeholder only (no longer controls settings icon visibility)
    function applyHidePlaceholder(shouldHide) {
        searchInput.setAttribute('placeholder', shouldHide ? '' : defaultPlaceholder);
    }
    applyHidePlaceholder(hidePlaceholder);

    // Apply independent settings icon visibility
    function applyAlwaysShowSettings(shouldShow) {
        if (!settingsTriggerContainer) return;
        settingsTriggerContainer.classList.toggle('always-visible', !!shouldShow);
    }

    // --- Small helpers: Settings panel controls ---
    function isSettingsOpen() {
        return settingsPanel && !settingsPanel.classList.contains('hidden');
    }

    function openSettingsPanel() {
        if (settingsPanel) settingsPanel.classList.remove('hidden');
    }

    function closeSettingsPanel() {
        if (settingsPanel) settingsPanel.classList.add('hidden');
    }

    function toggleSettingsPanel(forceState) {
        if (!settingsPanel) return;
        const shouldOpen = typeof forceState === 'boolean' ? forceState : settingsPanel.classList.contains('hidden');
        settingsPanel.classList.toggle('hidden', !shouldOpen);
    }

    // --- Small helpers: Suggestions rendering ---
    function clearSuggestions() {
        suggestionsList.innerHTML = '';
    }

    function setSuggestionsLoading() {
        suggestionsList.innerHTML = `<li><a><span>Loading...</span></a></li>`;
    }

    function getFaviconUrl(origin) {
        return `https://www.google.com/s2/favicons?sz=32&domain_url=${origin}`;
    }

    function buildSuggestionItem(item) {
        const urlObj = new URL(item.url);
        const suggestionItem = document.createElement('li');
        suggestionItem.className = 'search-result-item';

        const link = document.createElement('a');
        link.href = item.url;

        const favicon = document.createElement('img');
        favicon.src = getFaviconUrl(urlObj.origin);
        favicon.alt = '';
        favicon.width = 16;
        favicon.height = 16;

        const title = document.createElement('span');
        title.textContent = item.title || item.url;

        const arrow = document.createElement('span');
        arrow.textContent = '→';

        link.append(favicon, title, arrow);
        link.innerHTML += pinnerSvg;
        suggestionItem.append(link);
        return suggestionItem;
    }

    function renderSuggestionItems(items) {
        clearSuggestions();
        items.forEach(item => suggestionsList.append(buildSuggestionItem(item)));
    }
    applyAlwaysShowSettings(alwaysShowSettings);

    // Save the setting to localStorage when the checkbox is changed
    focusOnLoadCheckbox.addEventListener('change', () => {
        localStorage.setItem('focusOnLoad', focusOnLoadCheckbox.checked);
    });

    hidePlaceholderCheckbox.addEventListener('change', () => {
        localStorage.setItem('hidePlaceholder', hidePlaceholderCheckbox.checked);
        applyHidePlaceholder(hidePlaceholderCheckbox.checked);
    });

    if (alwaysShowSettingsCheckbox) {
        alwaysShowSettingsCheckbox.addEventListener('change', () => {
            localStorage.setItem('alwaysShowSettings', alwaysShowSettingsCheckbox.checked);
            applyAlwaysShowSettings(alwaysShowSettingsCheckbox.checked);
        });
    }

    /**
     * Sets the active search engine and updates the search URL.
     * @param {HTMLElement} engineElement - The clicked search engine element.
     */
    function getEngineButtons() {
        return searchEnginesNav.querySelectorAll('.search-engine');
    }

    function setActiveSearchEngine(engineElement) {
        getEngineButtons().forEach(el => el.classList.remove('active'));
        engineElement.classList.add('active');
        currentSearchUrl = engineElement.dataset.url;
        activeEngineKey = engineElement.dataset.key || activeEngineKey;
        localStorage.setItem('activeEngine', activeEngineKey);
    }

    async function loadEngines() {
        try {
            const url = chrome.runtime.getURL('search_engines.json');
            const res = await fetch(url);
            const defaultEngines = await res.json();
            const storedVisibility = JSON.parse(localStorage.getItem('engineVisibility') || '{}');
            engines = defaultEngines.map(e => ({
                ...e,
                visible: storedVisibility[e.key] !== undefined ? storedVisibility[e.key] : e.visible
            }));
        } catch (e) {
            engines = [
                { key: 'startpage', name: 'Startpage', url: 'https://www.startpage.com/sp/search?q=', visible: true },
                { key: 'google', name: 'Google', url: 'https://www.google.com/search?q=', visible: true },
                { key: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', visible: true },
                { key: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai/search?q=', visible: true },
            ];
        }
    }

    function saveVisibility() {
        const map = engines.reduce((acc, e) => { acc[e.key] = !!e.visible; return acc; }, {});
        localStorage.setItem('engineVisibility', JSON.stringify(map));
    }

    function renderEngines() {
        searchEnginesNav.innerHTML = '';
        const visibleEngines = engines.filter(e => e.visible);
        if (!visibleEngines.some(e => e.key === activeEngineKey)) {
            activeEngineKey = (visibleEngines[0] ? visibleEngines[0].key : engines[0].key);
            localStorage.setItem('activeEngine', activeEngineKey);
        }

        visibleEngines.forEach((e, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'search-engine' + (e.key === activeEngineKey ? ' active' : '');
            btn.dataset.url = e.url;
            btn.dataset.key = e.key;
            btn.textContent = e.name;
            searchEnginesNav.appendChild(btn);
            if (idx < visibleEngines.length - 1) {
                const sep = document.createElement('span');
                sep.className = 'arrow';
                sep.setAttribute('aria-hidden', 'true');
                sep.textContent = '/';
                searchEnginesNav.appendChild(sep);
            }
        });

        const activeBtn = searchEnginesNav.querySelector('.search-engine.active');
        if (activeBtn) {
            currentSearchUrl = activeBtn.dataset.url;
        }
        attachEngineEvents();
    }

    /** Render settings checkboxes for engines using same structure/styles as other toggles */
    function renderEngineSettings() {
        if (!engineSettings) return;
        engineSettings.innerHTML = '';
        engines.forEach(e => {
            const container = document.createElement('div');
            container.className = 'container';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `engine-${e.key}`;
            input.className = 'engine-toggle';
            input.checked = !!e.visible;

            const label = document.createElement('label');
            label.setAttribute('for', input.id);

            const checkDiv = document.createElement('div');
            checkDiv.className = 'check';
            checkDiv.innerHTML = `
                <svg width="14px" height="14px" viewBox="0 0 18 18">
                  <path d="M 1 9 L 1 9 c 0 -5 3 -8 8 -8 L 9 1 C 14 1 17 5 17 9 L 17 9 c 0 4 -4 8 -8 8 L 9 17 C 5 17 1 14 1 9 L 1 9 Z"></path>
                  <polyline points="1 9 7 14 15 4"></polyline>
                </svg>
            `;

            const nameSpan = document.createElement('span');
            nameSpan.textContent = ` Show ${e.name}`;

            label.appendChild(checkDiv);
            label.appendChild(nameSpan);

            input.addEventListener('change', () => {
                // Enforce at least one visible engine
                const visibleCount = engines.filter(x => x.visible).length;
                if (!input.checked && visibleCount === 1 && e.visible) {
                    input.checked = true;
                    return;
                }
                e.visible = input.checked;
                saveVisibility();
                if (!e.visible && activeEngineKey === e.key) {
                    const firstVisible = engines.find(x => x.visible);
                    if (firstVisible) {
                        activeEngineKey = firstVisible.key;
                        localStorage.setItem('activeEngine', activeEngineKey);
                    }
                }
                renderEngines();
            });

            container.appendChild(input);
            container.appendChild(label);
            engineSettings.appendChild(container);
        });
    }

    /**
     * Asynchronously fetches and displays search suggestions from the browser's history.
     * It prioritizes results from the user's top sites and combines them
     * with other history items that match the current query, displaying the top 5
     * unique results.
     */
    async function showSearchSuggestions() {
        setSuggestionsLoading();
        currentQuery = searchInput.value.trim().toLowerCase();

        if (!currentQuery) {
            clearSuggestions();
            return;
        }

        if (chrome.topSites && chrome.history) {
            // First, get the user's most visited sites.
            chrome.topSites.get((topSites) => {
                const filteredTopSites = topSites.filter(site =>
                    site.title.toLowerCase().includes(currentQuery) ||
                    site.url.toLowerCase().includes(currentQuery)
                );

                // Then, search the rest of the history for other matches.
                chrome.history.search({ text: currentQuery, maxResults: 100 }, (historyItems) => {
                    const combined = [...filteredTopSites];
                    historyItems.forEach(item => {
                        if (!combined.some(site => site.url === item.url)) combined.push(item);
                    });

                    // Display a limited number of the best suggestions.
                    renderSuggestionItems(combined.slice(0, 6));
                });
            });
        } else {
            suggestionsList.innerHTML = '<li><a><span>History API not available</span></a></li>';
        }
    }

    /**
     * Focuses the first search result in the suggestions list.
     */
    function focusFirstSuggestion() {
        const firstSuggestion = document.querySelector(".search-result-item a");
        if (firstSuggestion) {
            firstSuggestion.focus();
            searchInput.value = firstSuggestion.href
        }
    }

    /**
     * Moves focus up or down in the suggestions list.
     * @param {number} direction - 1 for down, -1 for up.
     * @param {HTMLElement} currentFocused - The currently focused element.
     */
    function moveFocusInSuggestions(direction, currentFocused) {
        const allSuggestions = Array.from(document.querySelectorAll(".search-result-item a"));
        const currentIndex = allSuggestions.findIndex(el => el === currentFocused);
        if (currentIndex === -1) return;

        const nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < allSuggestions.length) {
            allSuggestions[nextIndex].focus();
            searchInput.value = allSuggestions[nextIndex].href
        }
    }

    /**
     * Starts a search with the current query and active search engine.
     */
    function performSearch() {
        if (!currentQuery) return;
        currentQuery = searchInput.value.trim();
        searchBtn.classList.add('loading');
        location.href = `${currentSearchUrl}+${encodeURIComponent(currentQuery)}`;
    }

    // --- Event Listeners ---
    function attachEngineEvents() {
        getEngineButtons().forEach((engine) => {
            engine.addEventListener("click", () => setActiveSearchEngine(engine));
            engine.addEventListener("keydown", (e) => {
                const now = Date.now();
                if (e.key === "Enter") {
                    if (now - lastEnterPressTime < DOUBLE_PRESS_DELAY_MS) {
                        performSearch();
                    }
                    lastEnterPressTime = now;
                }
            });
        });
    }

    (async function initEngines() {
        await loadEngines();
        saveVisibility();
        renderEngines();
        renderEngineSettings();
    })();

    // Handle input changes for suggestions
    searchInput.addEventListener("input", async () => {
        currentQuery = searchInput.value.trim();
        if (!currentQuery) {
            suggestionsList.innerHTML = '';
            return;
        }
        await showSearchSuggestions();
    });

    // Handle keyboard navigation
    function handleSlashFocus(e) {
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
    }

    function handleSettingsToggleShortcut(e) {
        if (e.altKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            toggleSettingsPanel();
        }
    }

    function handleEscapeClose(e) {
        if (e.key === 'Escape' && isSettingsOpen()) {
            e.preventDefault();
            closeSettingsPanel();
        }
    }

    function handleArrowKeys(e) {
        if (e.key === 'ArrowDown') {
            if (e.target === searchInput) {
                focusFirstSuggestion();
            } else {
                moveFocusInSuggestions(1, e.target);
            }
        }
        if (e.key === 'ArrowUp') {
            if (e.target === document.querySelector(".search-result-item a") || e.target === searchInput) {
                searchInput.focus();
                setTimeout(() => {
                    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
                }, 0);
            } else {
                moveFocusInSuggestions(-1, e.target);
            }
        }
    }

    function handleGlobalKeydown(e) {
        handleSlashFocus(e);
        handleSettingsToggleShortcut(e);
        handleEscapeClose(e);
        handleArrowKeys(e);
    }

    document.addEventListener('keydown', handleGlobalKeydown);

    function handleDocumentClick(e) {
        if (settingsPanel && !settingsPanel.contains(e.target)) {
            closeSettingsPanel();
        }
        if (e.target === settingsTrigger) {
            openSettingsPanel();
        }
        // Add 'loadingg' class to clicked search result links
        if (e.target.closest('.search-result-item a')) {
            e.target.closest('.search-result-item a').classList.add('loading');
        }
    }

    document.addEventListener('click', handleDocumentClick);

    // Handle form submission
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        performSearch();
    });

    // Focus the search input on page load
    searchInput.focus();
});
