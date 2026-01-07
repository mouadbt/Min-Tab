import { fetchResources } from './utils.js';
import { buildTheSvgIcon } from './ui.js';

// the fucntion that start excuting after the user start typing and holds all the logic from getting the suggestions tell going to the user's distination
export const initLogic = () => {
    const searchInput = document.querySelector("#search-input");
    const searchBtn = document.querySelector("#search-btn");
    const suggestionsList = document.querySelector("#suggestions-list");

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
            clearSuggestions(suggestionsList);
            return;
        }
        showSuggestions(query, suggestionsList);
    });
};

/**
 * Asynchronously fetches and displays search suggestions from the browser's history
 * It prioritizes results from the user's top sites and combines them
 * with other history items that match the current query, displaying the top 5
 * unique results
 */
const showSuggestions = (query, suggestionsList) => {

    // Check if we have access to the browser top site and history
    if (chrome.topSites && chrome.history) {
        // Then, get the user's most visited sites from his browser
        chrome.topSites.get((topSites) => {
            const filteredTopSites = topSites.filter((site) => {
                site.title.toLowerCase().includes(query)
                    ||
                    site.url.toLowerCase().includes(query)
            });

            // Fetch throw the rest of the history for other matches
            chrome.history.search({ text: query, maxResults: 100 }, (historyItems) => {
                const combined = [...filteredTopSites];
                historyItems.forEach(item => {
                    if (!combined.some(site => site.url === item.url)) combined.push(item);
                });

                // Display the suggestions.
                renderSuggestionItems(combined.slice(0, 6), suggestionsList);
            });
        });
    } else {
        suggestionsList.innerHTML = '<li><a><span>We have issue getting the suggestion from your browser</span></a></li>';
    }
};

// show the suggestions in the suggestions list when user start typing
const renderSuggestionItems = async (items, suggestionsList) => {

    // clear the old suggestion from the page
    clearSuggestions(suggestionsList);

    // get the svg loading icon from the json file
    const loadingSvgContent = await getLoadingSvgContent();

    // start rendering the suggestions
    items.forEach(item => suggestionsList.append(buildSuggestionItem(item, loadingSvgContent)));
};

// get loading svg from the json file
const getLoadingSvgContent = async () => {
    const svgIcons = await fetchResources('icons');
    return svgIcons["loading"].content;
};

// Build the actual suggestion item
const buildSuggestionItem = (item, loadingSvgContent) => {
    const urlObj = new URL(item.url);
    const suggestionItem = document.createElement('li');
    suggestionItem.className = 'search-result-item';

    const link = document.createElement('a');
    link.classList.add("suggestion-link")
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
    buildTheSvgIcon(loadingSvgContent, link, true);
    suggestionItem.append(link);
    return suggestionItem;
};

// Get the Icon of the wesbite to show it in the suggested website
const getFaviconUrl = (origin) => {
    return `https://www.google.com/s2/favicons?sz=32&domain_url=${origin}`;
};

// remove the suggestions from the suggestions list
const clearSuggestions = (suggestionsList) => {
    suggestionsList.innerHTML = '';
};