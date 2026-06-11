import { getTopSitesChrome, getTopSitesFirefox } from "./suggestions.js";
import { renderIcons } from "./ui.js";
import { fetchResources, loadData, saveData, showToast } from "./utils.js";
const isFirefox = typeof browser !== 'undefined';
const topSitesContainer = document.querySelector("#top-website-list-container");
const manageTopSitesButton = document.querySelector("#manage-top-websites-btn");
const topSiteInput = document.querySelector("#add-top-site-input");
const addTopSiteButton = document.querySelector("#new-top-site-btn");
let topSites = [];

// Main logic to initilize Top Website logic
export async function initTopWebsiteLogic() {

    // handle editing of top websites list element visibility
    if (manageTopSitesButton) {
        manageTopSitesButton.addEventListener("click", () => {
            if (topSitesContainer) {
                topSitesContainer.classList.toggle("edit-mode");
            }
        });
    }

    // handle getting top sties from memory of browsers history
    topSites = loadData("topSites", []);
    if (topSites.length > 0) {
        renderTopSites(topSites);
    } else {
        const browserSites = await loadTopSitesFromBrowser();
        topSites = generateTopSitesArray(browserSites);
        renderTopSites(topSites);
        saveData("topSites", topSites);
    }

    // handle adding new favourite website
    if (topSiteInput) {
        const action = topSiteInput.dataset.action;
        topSiteInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                handleTopSiteSubmit(action);
            }
        });
    }
    if (addTopSiteButton) {
        addTopSiteButton.addEventListener('click', () => {
            handleTopSiteSubmit('add');
        });
    }
}

// load top websites from browser firefox based or chrome based
async function loadTopSitesFromBrowser() {
    if (isFirefox) {
        return getTopSitesFirefox();
    } else {
        return new Promise(resolve => getTopSitesChrome(resolve));
    }
}

// Render Top sites list to the ui
function renderTopSites(topSites) {
    const topSitesList = document.querySelector("#top-website-list");
    if (!topSitesList) return;

    // Clear existing content safely without innerHTML
    while (topSitesList.firstChild) {
        topSitesList.removeChild(topSitesList.firstChild);
    }

    topSites.forEach((site, index) => {
        // Create the main list item for the link
        const li = document.createElement("li");
        li.className = "link";

        // Create the anchor element
        const a = document.createElement("a");
        a.href = site.url;

        const titleSpan = document.createElement("span");
        titleSpan.textContent = site.title;
        a.appendChild(titleSpan);
        li.appendChild(a);

        // Create the actions buttons container
        const actionsContainer = document.createElement("div");
        actionsContainer.className = "actions-btns";

        // Edit button
        const editButton = createIconButton({
            icon: "pen",
            title: "edit link",
            id: site.id
        });
        actionsContainer.appendChild(editButton);

        // Delete button
        const deleteButton = createIconButton({
            icon: "trash",
            title: "delete link",
            id: site.id
        });
        actionsContainer.appendChild(deleteButton);

        li.appendChild(actionsContainer);
        topSitesList.appendChild(li);

        // Add separator if not the last item
        if (index < topSites.length - 1) {
            const separatorItem = document.createElement("li");
            const separatorText = document.createElement("span");
            separatorText.textContent = "/";
            separatorItem.appendChild(separatorText);
            topSitesList.appendChild(separatorItem);
        }
    });

    // Re-render icons for the new buttons
    fetchResources("icons").then(icons => {
        if (icons) renderIcons(icons);
    });
}

// helper fucntion to genearte buttons
function createIconButton({ icon, title, id }) {
    const button = document.createElement("button");

    button.tabIndex = -1;
    button.className = "icon-btn";
    button.dataset.icon = icon;
    button.title = title;
    button.setAttribute("aria-label", title);
    button.dataset.id = id;

    return button;
}

// genrate arrya of top websites by including id for element
function generateTopSitesArray(topSites) {
    const firstEightSites = topSites.slice(0, 8);
    return firstEightSites.map(el => {
        const siteId = genratesiteId();
        const title = el.title || el.url;
        const maxTitleLength = 15;
        const displayTitle = title.length > maxTitleLength
            ? title.slice(0, maxTitleLength) + ".."
            : title;
        return { id: siteId, title: displayTitle, url: el.url };
    });
}

function handleTopSiteSubmit(action) {
    const inputValue = topSiteInput.value.trim();
    if (!inputValue) return;
    switch (action) {
        case 'add':
            const success = addTopSite(inputValue);
            if (success) {
                topSiteInput.value = '';
            }
            break;
        default:
            break;
    }
}

function addTopSite(inputValue) {
    const isValid = isValidUrl(inputValue);
    if (!isValid) {
        showToast("Pls Enter Valid URL. it must start with https://");
        return false;
    }

    const url = new URL(inputValue);
    const domain = url.hostname.replace('www.', '');
    const newSite = {
        id: genratesiteId(),
        title: domain,
        url: inputValue
    };

    topSites.push(newSite);
    saveData("topSites", topSites);
    renderTopSites(topSites);
    return true;
}

// check if inputValue is URL
function isValidUrl(inputValue) {
    try {
        new URL(inputValue);
        return true;
    } catch {
        return false;
    }
}

function genratesiteId() {
    return crypto.randomUUID().slice(0, 8);
}