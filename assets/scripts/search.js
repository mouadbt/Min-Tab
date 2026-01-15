export function performSearch(query) {

    if (!query) {
        return;
    }

    const engines = JSON.parse(localStorage.getItem('searchEngines'));

    if (isValidUrl(query)) {
        window.location.href = query;
        console.log(query);
        return;
    }

    const engine = engines.find(el => el.preferred);
    const engineURL = engine?.preferred ? engine?.url : 'https://www.startpage.com/sp/search?q=';

    const url = `${engineURL}${encodeURIComponent(query)}`;
    window.location.href = url;
}

function isValidUrl(str) {

    try {
        new URL(str);
        return true;
    } catch {
        // Check again if new URL method failed using a simpler regex for common domain patterns
        const domainRegex = /^(?:[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?::[0-9]{1,5})?(?:\/.*)?$/;

        if (domainRegex.test(str)) {
            return true;
        }
        return false;
    }
}