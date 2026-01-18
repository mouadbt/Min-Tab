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
};

// Get the defaults data from the localstorage or the default
export const loadData = (key, defaults) => {
    const raw = localStorage.getItem(key);
    try {
        return raw ? JSON.parse(raw) : defaults;
    } catch {
        return defaults;
    }
};

// Store updated data in localstorage
export const saveData = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};