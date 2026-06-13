import { getTopSitesChrome, getTopSitesFirefox } from "./suggestions.js";
import { renderIcons } from "./ui.js";
import { fetchResources, hideToast, loadData, saveData, showToast } from "./utils.js";
const isFirefox = typeof browser !== 'undefined';
const topSitesContainer = document.querySelector("#top-website-list-container");
const manageTopSitesButton = document.querySelector("#manage-top-websites-btn");
const topSiteInput = document.querySelector("#add-top-site-input");
const addTopSiteButton = document.querySelector("#new-top-site-btn");
const topSitesList = document.querySelector("#top-website-list");
let topSites = [];
// temporarily stores the new site url until its title is added
let newFavUrl = null;
// temporarily stores the title of the site currently edited  
const topSiteToEdit = {
    id: null,
    title: null,
    url: null
}

// tracks the site pending delete confirmation
let OnDeleteState = {
    onHold: false,
    id: null
};

// map of action buttons to their handlers
const actions = {
    delete: (id) => handledeleteTopSite(id),
    edit: (id) => handleEditTopSite(id),
};

// Main logic to initialize Top Website logic
export async function initTopWebsiteLogic() {

    // handle editing of top websites list element visibility
    if (manageTopSitesButton) {
        manageTopSitesButton.addEventListener("click", () => {
            if (topSitesContainer) {
                topSitesContainer.classList.toggle("edit-mode");
            }
        });
    }

    // handle getting top sites from memory or browser's history
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
        topSiteInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                handleTopSiteSubmit();
            }
        });
    }
    if (addTopSiteButton) {
        addTopSiteButton.addEventListener('click', () => {
            handleTopSiteSubmit();
        });
    }

    // handle delete top site event
    topSitesList.addEventListener("click", (e) => {
        const actionBtn = e.target.closest(".top-site-action-button");
        if (!actionBtn) return;
        const { id, action } = actionBtn.dataset;
        actions[action]?.(id);
    });

    // handle keyboard confirm/cancel for delete
    document.addEventListener('keydown', (e) => {
        if (OnDeleteState.onHold === true) {
            if (e.key === "Enter") {
                deleteTopSite(topSites);
            } else if (e.key === "Escape") {
                hideToast();
                toggleDeletionConfirmationMode(false);
            }
        }
    });
};

// load top websites from browser firefox based or chrome based
async function loadTopSitesFromBrowser() {
    if (isFirefox) {
        return getTopSitesFirefox();
    } else {
        return new Promise(resolve => getTopSitesChrome(resolve));
    }
};

// generate array of top websites by including id for element
function generateTopSitesArray(topSites) {
    const firstEightSites = topSites.slice(0, 8);
    return firstEightSites.map(el => {
        const siteId = generateSiteId();
        const title = el.title || el.url;
        const maxTitleLength = 15;
        const displayTitle = title.length > maxTitleLength
            ? title.slice(0, maxTitleLength) + ".."
            : title;
        return { id: siteId, title: displayTitle, url: el.url };
    });
};

// Render Top sites list to the ui
function renderTopSites(topSites) {
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
            id: site.id,
            action: "edit"
        });
        actionsContainer.appendChild(editButton);

        // Delete button
        const deleteButton = createIconButton({
            icon: "trash",
            title: "delete link",
            id: site.id,
            action: "delete"
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
};

// helper function to generate buttons
function createIconButton({ icon, title, id, action }) {
    const button = document.createElement("button");

    button.tabIndex = -1;
    button.classList.add("icon-btn", "top-site-action-button");
    button.dataset.icon = icon;
    button.dataset.action = action;
    button.title = title;
    button.setAttribute("aria-label", title);
    button.dataset.id = id;

    return button;
};

// the core engine that handles managing of top websites (add new, modify existing)
function handleTopSiteSubmit(topSiteId = null) {
    const inputValue = topSiteInput.value.trim();
    const action = topSiteInput.dataset.action;
    const siteId = generateSiteId();
    if (!inputValue) return;
    const isValid = isValidUrl(inputValue);
    switch (action) {
        // first step: validate url then ask for title
        case 'addNewUrl':
            if (!isValid) {
                showToast("Please Enter Valid URL. it must start with https://");
                return false;
            } else {
                newFavUrl = inputValue;
                updateTopSiteInputMetaData('', 'Add title for your URL', 'addNewTitle', "Link is saved, now add title of the link");
                topSiteInput.focus();
            }
            break;
        // second step: save new site with title and url
        case 'addNewTitle':
            topSites.push({ id: siteId, title: inputValue, url: newFavUrl });
            saveData("topSites", topSites);
            renderTopSites(topSites);
            updateTopSiteInputMetaData('', 'Add new favourite website link', 'addNewUrl', "Link is added successfully");

            break;
        // first step of edit: validate new url then ask for title
        case 'editUrl':
            if (!isValid) {
                showToast("Please Enter Valid URL. it must start with https://");
                return false;
            } else {
                // newFavUrlObj.url = inputValue;
                updateTopSiteInputMetaData('', 'Edit title', 'editTitle', "Link is updated, now edit the title of the link");
                topSiteInput.focus();
            }
            break;
        // second step of edit: save updated site
        case 'editTitle':
            // newFavUrlObj.title = inputValue;
            // newFavUrlObj.id = siteId;
            // topSites.push(newFavUrlObj);
            saveData("topSites", topSites);
            renderTopSites(topSites);
            updateTopSiteInputMetaData('', 'Add new favourite website link', 'addNewUrl', "Link is updated successfully");
            break;

        default:
            break;
    }
};

// Update state of the input
function updateTopSiteInputMetaData(value, placeholder, dataAction, toastMsg = null) {
    topSiteInput.value = value;
    topSiteInput.placeholder = placeholder;
    topSiteInput.dataset.action = dataAction;
    if (toastMsg) {
        showToast(toastMsg);
    }
};

// Handle delete top site from favourite list
function handledeleteTopSite(id) {
    toggleDeletionConfirmationMode(true);
    OnDeleteState.id = id;
    showToast(`Are you sure you want to remove this website ? Press "Enter" to confirm, "Esc" to cancel`, false);
};

function deleteTopSite(topSiteslist) {
    const id = OnDeleteState.id;
    topSites = topSiteslist.filter(el => el.id != id);
    saveData("topSites", topSites);
    renderTopSites(topSites);
    toggleDeletionConfirmationMode(false);
    OnDeleteState.id = null;
    showToast("Favourite website removed successfully");
};

// Handle edit top site from favourite list
function handleEditTopSite(id) {
    topSiteToEdit = topSites.find((el) => el.id === id);
    topSiteInput.value = topSiteToEdit.url;
    topSiteInput.dataset.action = editeFavSiteTitle;
};

// enable/disable deletion confirmation mode and lock UI interaction state
function toggleDeletionConfirmationMode(isDeletePending = true) {
    OnDeleteState.onHold = isDeletePending;
    document.body.classList.toggle('prevent-ui-interactivity', isDeletePending);
};


// check if inputValue is URL
function isValidUrl(inputValue) {
    try {
        new URL(inputValue);
        return true;
    } catch {
        return false;
    }
};

// generate a random id
function generateSiteId() {
    return crypto.randomUUID().slice(0, 8);
};