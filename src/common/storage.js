export function getLocalStorageValueOrDefault(key, defaultValue) {
    const localStorageItem = localStorage.getItem(key);

    return localStorageItem ? JSON.parse(localStorageItem) : defaultValue;
}
