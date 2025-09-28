// This ensures that the search input is focused when the new tab is opened.
// It works by appending "?focus" to the URL and forcing a reload.
// The error is intentionally thrown to halt script execution on the initial load
if (location.search !== "?focus") {
    location.search = "?focus";
    throw new Error("Redirecting to focus mode");
}

document.addEventListener("DOMContentLoaded", () => {
    // --- Constants ---
    const DOUBLE_PRESS_DELAY_MS = 300; // Time window for double Enter press

    // --- DOM Elements ---
    const searchEngines = document.querySelectorAll(".search-engine");
    const searchForm = document.querySelector("form");
    const searchInput = document.querySelector("#search-input");
    const suggestionsList = document.getElementById("suggestions");

    // --- State ---
    let lastEnterPressTime = 0;
    let currentSearchUrl = 'https://www.startpage.com/sp/search?q=';
    let currentQuery = '';

    // --- Helper Functions ---

    /**
     * Sets the active search engine and updates the search URL.
     * @param {HTMLElement} engineElement - The clicked search engine element.
     */
    function setActiveSearchEngine(engineElement) {
        searchEngines.forEach(el => el.classList.remove("active"));
        engineElement.classList.add('active');
        currentSearchUrl = engineElement.dataset.url;
    }

    /**
     * Fetches and displays search suggestions based on user input,
     * prioritizing frequently visited sites.
    */
    async function showSearchSuggestions() {
        suggestionsList.innerHTML = `<li><a><span>Loading...</span></a></li>`;
        currentQuery = searchInput.value.trim().toLowerCase();

        if (!currentQuery) {
            suggestionsList.innerHTML = '';
            return;
        }

        if (chrome.topSites && chrome.history) {
            // First, get the user's most visited sites.
            chrome.topSites.get((topSites) => {
                // Filter the top sites based on the current query.
                const filteredTopSites = topSites.filter(site =>
                    site.title.toLowerCase().includes(currentQuery) ||
                    site.url.toLowerCase().includes(currentQuery)
                );

                // Then, search the rest of the history for other matches.
                chrome.history.search({ text: currentQuery, maxResults: 100 }, (historyItems) => {
                    // Combine and de-duplicate the results, giving priority to top sites.
                    const combined = [...filteredTopSites];
                    historyItems.forEach(item => {
                        if (!combined.some(site => site.url === item.url)) {
                            combined.push(item);
                        }
                    });

                    suggestionsList.innerHTML = '';
                    // Display a limited number of the best suggestions.
                    combined.slice(0, 5).forEach(item => {
                        const url = new URL(item.url);
                        const faviconUrl = `https://www.google.com/s2/favicons?sz=32&domain_url=${url.origin}`;

                        const suggestionItem = document.createElement('li');
                        suggestionItem.className = 'search-result-item';

                        const link = document.createElement('a');
                        link.href = item.url;

                        const favicon = document.createElement('img');
                        favicon.src = faviconUrl;
                        favicon.alt = '';
                        favicon.width = 16;
                        favicon.height = 16;

                        const title = document.createElement('span');
                        title.textContent = item.title || item.url;

                        const arrow = document.createElement('span');
                        arrow.textContent = '→';

                        link.append(favicon, title, arrow);
                        suggestionItem.append(link);
                        suggestionsList.append(suggestionItem);
                    });
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
            searchInput.value = firstSuggestion.querySelector('span').textContent
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
            searchInput.value = allSuggestions[nextIndex].querySelector('span').textContent
        }
    }

    /**
     * Starts a search with the current query and active search engine.
     */
    function performSearch() {
        if (!currentQuery) return;
        currentQuery = searchInput.value.trim();
        location.href = `${currentSearchUrl}+${encodeURIComponent(currentQuery)}`;
    }

    // --- Event Listeners ---

    // Set up search engine selection
    searchEngines.forEach((engine) => {
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
    document.addEventListener('keydown', (e) => {
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
    });

    // Handle form submission
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        performSearch();
    });

    // Focus the search input on page load
    searchInput.focus();
});
