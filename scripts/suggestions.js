import { fetchResources } from './utils.js';
import { buildTheSvgIcon } from './ui.js';

const isFirefox = typeof browser !== 'undefined';

// the function that start executing after the user start typing and holds all the logic from getting the suggestions tell going to the user's destination
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
}

const showSuggestions = async (query, suggestionsList) => {

    // Check if browser APIs are available
    const hasTopSites = (isFirefox && typeof browser !== 'undefined'
        && browser.topSites) || (!isFirefox && typeof chrome !== 'undefined' && chrome.topSites);
    const hasHistory = (isFirefox && typeof browser !== 'undefined' && browser.history) || (!isFirefox && typeof chrome !== 'undefined' && chrome.history);

    if (!hasTopSites || !hasHistory) {
        suggestionsList.innerHTML = '<li><a class="suggestion-link"><span>We have issue getting the suggestion from your browser</span><span></span></a></li>';
        return;
    }

    let topSites = [];
    let historyItems = [];

    if (isFirefox) {
        // Get data from Firefox
        topSites = await getTopSitesFirefox();
        historyItems = await searchHistoryFirefox({
            text: query,
            maxResults: 100
        });
    } else {
        // Get data from Chrome
        topSites = await new Promise(resolve => getTopSitesChrome
            (resolve));
        historyItems = await new Promise(resolve =>
            searchHistoryChrome({ text: query, maxResults: 100 }, resolve));
    }

    const filteredTopSites = topSites.filter((site) => {
        return site.title && (site.title.toLowerCase().includes(query)
            || site.url.toLowerCase().includes(query));
    });

    const combined = [...filteredTopSites];
    historyItems.forEach(item => {
        if (!combined.some(site => site.url === item.url)) combined.
            push(item);
    });

    // Display the suggestions.
    renderSuggestionItems(combined.slice(0, 6), suggestionsList);
}

// show the suggestions in the suggestions list when user start typing
const renderSuggestionItems = async (items, suggestionsList) => {

    // clear the old suggestion from the page
    clearSuggestions(suggestionsList);

    // get the svg loading icon from the json file
    const loadingSvgContent = await getLoadingSvgContent();

    // start rendering the suggestions
    items.forEach(item => suggestionsList.append(buildSuggestionItem(item, loadingSvgContent)));
}

// Get top sites from Firefox
const getTopSitesFirefox = async () => {
    try {
        return await browser.topSites.get();
    } catch (error) {
        console.error('Error getting top sites from Firefox:',
            error);
        return [];
    }
}

// Get top sites from Chrome
const getTopSitesChrome = (callback) => {
    chrome.topSites.get((topSites) => {
        callback(topSites || []);
    });
}

// Search history in Firefox (uses Promises) 
const searchHistoryFirefox = async (options) => {
    try {
        return await browser.history.search(options);
    } catch (error) {
        console.error('Error searching history in Firefox:', error);
        return [];
    }
}

// Search history in Chrome
const searchHistoryChrome = (options, callback) => {
    chrome.history.search(options, (historyItems) => {
        callback(historyItems || []);
    });
}

// get loading svg from the json file
const getLoadingSvgContent = async () => {
    const svgIcons = await fetchResources('icons');
    return svgIcons["loading"].content;
}

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
}

// Get the Icon of the website to show it in the suggested website
const getFaviconUrl = (origin) => {
    return `https://www.google.com/s2/favicons?sz=32&domain_url=${origin}`;
}

// remove the suggestions from the suggestions list
const clearSuggestions = (suggestionsList) => {
    suggestionsList.innerHTML = '';
}