// throw new Error for focusing on search input of the new tab instead of the browser address bar 
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
     * Fetches and displays search suggestions based on user input.
     */
    async function showSearchSuggestions() {
        suggestionsList.innerHTML = `<li><a><span>Loading...</span></a></li>`;
        if (!chrome.history?.search) {
            suggestionsList.innerHTML = '';
            return;
        }
        chrome.history.search({ text: currentQuery, maxResults: 5 }, (historyItems) => {
            suggestionsList.innerHTML = '';
            historyItems.forEach(item => {
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
