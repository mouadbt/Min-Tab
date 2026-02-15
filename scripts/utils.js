// Get data from resources
export const fetchResources = async (key) => {
    try {
        const res = await fetch(`./assets/data/${key}.json`);
        if (!res.ok) throw new Error(`Failed to fetch ${key}`);
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

// Get the defaults data from the localstorage or the default
export const loadData = (key, defaults) => {
    const raw = localStorage.getItem(key);
    try {
        return raw ? JSON.parse(raw) : defaults;
    } catch {
        return defaults;
    }
}

// Store updated data in localstorage
export const saveData = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
}

// Toggles CSS theme variables between light and dark mode based on isactive
export const switchToLightMode = (isactive) => {
    const root = document.documentElement;

    if (isactive) {
        // Light mode
        root.style.setProperty('--background', '#ffffff');
        root.style.setProperty('--foreground', 'hsl(0, 0%, 10%)');
        root.style.setProperty('--foreground50', 'hsl(0, 0%, 50%)');
        root.style.setProperty('--foreground75', 'hsl(0, 0%, 85%)');
    } else {
        // Dark mode
        root.style.setProperty('--background', '#000000');
        root.style.setProperty('--foreground', 'hsl(0, 0%, 80%)');
        root.style.setProperty('--foreground50', 'hsl(0, 0%, 25%)');
        root.style.setProperty('--foreground75', 'hsl(0, 0%, 5%)');
    }
}

// Focus the cursor on the search input and override the browser's default behavior of focusing the address bar
export const focusOnSearchInput = (inputEl) => {
    inputEl.focus();
    if (location.search !== "?focus") {
        location.search = "?focus";
        throw new Error("Redirecting to focus mode");
    }
}