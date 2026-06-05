import { getTopSitesChrome, getTopSitesFirefox } from "./suggestions.js";
import { loadData } from "./utils.js";
const isFirefox = typeof browser !== 'undefined';
const topWebsiteListContainer = document.querySelector("#top-website-list-container");
const manageTopWebsitesBtn = document.querySelector("#manage-top-websites-btn");
let topsites = [];

// Main logic to initilize Top Website logic
export async function initTopWebsiteLogic() {
    if (manageTopWebsitesBtn) {
        manageTopWebsitesBtn.addEventListener("click", () => {
            if (topWebsiteListContainer) {
                topWebsiteListContainer.classList.toggle("edit-mode");
            }
        });
    }

    topsites = loadData("topsites", []);


    if (topsites.length > 0) {
        renderTopSites(topsites);
    } else {

        topsites = await loadTopSiteFromBrowser();
        const websites = genrateTopSitesArray(topsites);
        renderTopSites(websites);
    }
}

// load top websites from browser firefox based or chrome based
async function loadTopSiteFromBrowser() {
    if (isFirefox) {
        return getTopSitesFirefox();
    } else {
        return new Promise(resolve => getTopSitesChrome(resolve));
    }
}

// Render Top sites list to the ui
function renderTopSites(topSites) {
    console.log(topSites);
}

function genrateTopSitesArray(topsites) {

    const top8 = topsites.slice(0, 8);
    return top8.map(el => {
        const randomId = crypto.randomUUID().slice(0, 8);
        return { id: randomId, title: el.title, url: el.url };
    });

}