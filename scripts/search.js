export function performSearch(query) {

    if (!query) {
        return;
    }

    const engines = JSON.parse(localStorage.getItem('searchEngines'));
    const { isItUrl, queryFromFunction } = isValidUrl(query);
    if (isItUrl) {
        window.location.href = queryFromFunction;
        return;
    }
    let engineURL = 'https://www.startpage.com/sp/search?q=';
    if (engines) {
        const engine = engines.find(el => el.preferred);
        engineURL = engine.url;
    }
    const url = `${engineURL}${encodeURIComponent(query)}`;
    window.location.href = url;
}

// Check if the query is a url
function isValidUrl(str) {

    try {
        new URL(str);
        return { isItUrl: true, queryFromFunction: str }
    } catch {
        // Check again if new URL method failed using a simpler regex for common domain patterns
        const domainRegex = /^(?:[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?::[0-9]{1,5})?(?:\/.*)?$/;

        if (domainRegex.test(str)) {
            return { isItUrl: true, queryFromFunction: 'https://' + str }

        }
        return { isItUrl: false, queryFromFunction: null }
    }
}