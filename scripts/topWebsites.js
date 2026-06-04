const topWebsiteListContainer = document.querySelector("#top-website-list-container");
const manageTopWebsitesBtn = document.querySelector("#manage-top-websites-btn");
export function initTopWebsiteLogic() {
    if (manageTopWebsitesBtn) {
        manageTopWebsitesBtn.addEventListener("click", () => {
            if (topWebsiteListContainer) {
                topWebsiteListContainer.classList.toggle("edit-mode");
            }
        });
    }
}