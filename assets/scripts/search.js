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
        return false;
    }
}