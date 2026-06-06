import { getTopSitesChrome, getTopSitesFirefox } from "./suggestions.js";
import { loadData, saveData } from "./utils.js";
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
        const websitesArr = genrateTopSitesArray(topsites);
        renderTopSites(websitesArr);
        saveData("topsites", websitesArr);
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
function renderTopSites(websitesArr) {
    const topWebsiteList = document.querySelector("#top-website-list");
    if (!topWebsiteList) return;

    // Clear existing content safely without innerHTML
    while (topWebsiteList.firstChild) {
        topWebsiteList.removeChild(topWebsiteList.firstChild);
    }

    websitesArr.forEach((site, index) => {
        // Create the main list item for the link
        const li = document.createElement("li");
        li.className = "link";

        // Create the anchor element
        const a = document.createElement("a");
        a.href = site.url;

        const spanTitle = document.createElement("span");
        spanTitle.textContent = site.title;
        a.appendChild(spanTitle);
        li.appendChild(a);

        // Create the actions buttons container
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "actions-btns";

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.tabIndex = -1;
        editBtn.className = "icon-btn";
        editBtn.dataset.icon = "pen";
        editBtn.title = "edit link";
        editBtn.setAttribute("aria-label", "edit link");
        editBtn.dataset.id = site.id;
        actionsDiv.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.tabIndex = -1;
        deleteBtn.className = "icon-btn";
        deleteBtn.dataset.icon = "trash";
        deleteBtn.title = "delete link";
        deleteBtn.setAttribute("aria-label", "delete link");
        deleteBtn.dataset.id = site.id;
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(actionsDiv);
        topWebsiteList.appendChild(li);

        // Add separator if not the last item
        if (index < websitesArr.length - 1) {
            const separatorLi = document.createElement("li");
            const separatorSpan = document.createElement("span");
            separatorSpan.textContent = "/";
            separatorLi.appendChild(separatorSpan);
            topWebsiteList.appendChild(separatorLi);
        }
    });
}

function genrateTopSitesArray(topsites) {
    const top8 = topsites.slice(0, 8);
    return top8.map(el => {
        const randomId = crypto.randomUUID().slice(0, 8);
        const titleLimit = 15;
        const truncatedTitle = el.title.length > titleLimit 
            ? el.title.slice(0, titleLimit) + ".." 
            : el.title;
        return { id: randomId, title: truncatedTitle, url: el.url };
    });
}