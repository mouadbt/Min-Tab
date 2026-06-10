import { getTopSitesChrome, getTopSitesFirefox } from "./suggestions.js";
import { loadData, saveData, showToast } from "./utils.js";
const isFirefox = typeof browser !== 'undefined';
const topWebsiteListContainer = document.querySelector("#top-website-list-container");
const manageTopWebsitesBtn = document.querySelector("#manage-top-websites-btn");
const addTopSiteInput = document.querySelector("#add-top-site-input");
const newTopSiteBtn = document.querySelector("#new-top-site-btn");
const toast = document.querySelector("#toast");
let topsites = [];

// Main logic to initilize Top Website logic
export async function initTopWebsiteLogic() {

    // handle editing of top websites list element visibility
    if (manageTopWebsitesBtn) {
        manageTopWebsitesBtn.addEventListener("click", () => {
            if (topWebsiteListContainer) {
                topWebsiteListContainer.classList.toggle("edit-mode");
            }
        });
    }

    // handle getting top sties from memory of browsers history
    topsites = loadData("topsites", []);
    if (topsites.length > 0) {
        renderTopSites(topsites);
    } else {
        topsites = await loadTopSiteFromBrowser();
        const websitesArr = genrateTopSitesArray(topsites);
        renderTopSites(websitesArr);
        saveData("topsites", websitesArr);
    }

    // handle adding new favourite website
    if (addTopSiteInput) {
        const action = addTopSiteInput.dataset.action;
        addTopSiteInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                handleTopSiteInputSubmit(action);
            }
        });
    }
    if (newTopSiteBtn) {
        newTopSiteBtn.addEventListener('click', () => {
            handleSubmitNewTopWebsite();
        });
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

// genrate arrya of top websites by including id for element
function genrateTopSitesArray(topsites) {
    const top8 = topsites.slice(0, 8);
    return top8.map(el => {
        const randomId = genrateRandomId();
        const titleLimit = 15;
        const truncatedTitle = el.title.length > titleLimit
            ? el.title.slice(0, titleLimit) + ".."
            : el.title;
        return { id: randomId, title: truncatedTitle, url: el.url };
    });
}

function handleTopSiteInputSubmit(action) {
    const value = addTopSiteInput.value.trim();
    if (!value) return;
    switch (action) {
        case 'add':
            handleSubmitNewTopWebsite(value);
            break;
        default:
            break;
    }
}

// function topsitesManger(value, nextStep, errorMsg, customCallback) {}

function handleSubmitNewTopWebsite(value) {
    const isValidURL = isUrl(value);
    if (!isValidURL) {
        showToast("Pls Enter Valid URL. it must start with https://");
    } else {
        
    }
    // console.log({ newTopSite, isValidURL });
}

// check if value is URL
function isUrl(value) {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

function genrateRandomId() {
    return crypto.randomUUID().slice(0, 8);
}