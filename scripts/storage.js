const THEME_KEY = "my-little-library-theme";

export function readPreference(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
    } catch (error) {
        console.error(`Unable to read "${key}" from local storage.`, error);
        return fallback;
    }
}

export function savePreference(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Unable to save "${key}" to local storage.`, error);
    }
}

export function getTheme() {
    return readPreference(THEME_KEY, "light");
}

export function saveTheme(theme) {
    savePreference(THEME_KEY, theme);
}
