let activeIndex = -1; // input/button is focused

export const navigateBetweenSuggestions = (e, searchInput, suggestionsList, searchBtn) => {

    const suggestionItems = Array.from(suggestionsList.querySelectorAll('a'));

    const direction = e.key === "ArrowDown" ? 1 : -1;

    // Determine current active index
    if (e.target === searchInput || e.target === searchBtn) {
        activeIndex = -1;
    }
    else {
        activeIndex = suggestionItems.indexOf(e.target);
    };

    // Compute next index
    let nextIndex = activeIndex + direction;

    if (nextIndex < 0) {
        // Move focus to input when moving above first suggestion
        focusOnInput(searchInput);
        activeIndex = -1;
    } else if (nextIndex >= suggestionItems.length) {
        // Move focus to input when moving past last suggestion
        focusOnInput(searchInput);
        activeIndex = -1;
    } else {
        // Move focus to the suggestion item
        suggestionItems[nextIndex].focus();
        activeIndex = nextIndex;
    }
};

const focusOnInput = (input) => {
    input.focus();
    requestAnimationFrame(() => {
        const len = input.value.length;
        input.setSelectionRange(len, len);
    });
}