export const naigateBetweenSuggestions = (e, searchInput, suggestionsList, searchBtn) => {
    const suggestionItems = Array.from(suggestionsList.querySelectorAll('a'));
    if (e.key === "ArrowDown" && (e.target === searchInput || e.target === searchBtn)) {
        suggestionItems[0].focus();
    }
    if (e.key === "ArrowUp" && suggestionItems.includes(e.target)) {

        // console.log(document.activeElement, e.target);
        suggestionItems.forEach((_, i) => {
            if (i === 0) {
                searchInput.focus();
                console.log('1st');
            }
            else {
                suggestionItems[i + 1].focus();
            }
        });
    }
}