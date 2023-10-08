const storage = localStorage;

export function getStorageValueOrDefault(key, defaultValue) {
    const localStorageItem = storage.getItem(key);

    return localStorageItem ? JSON.parse(localStorageItem) : defaultValue;
}

export function setStorageValueFromEvent(event, keyName) {
    const { target } = event;
    const { type } = target;

    let valueToSet;

    if (type === 'number') {
        valueToSet = target.value;
    } else if (type === 'checkbox') {
        valueToSet = target.checked;
    } else {
        console.log(`Unknown input type: ${type}`);
        return null;
    }

    storage.setItem(keyName, valueToSet);

    return valueToSet;
}
