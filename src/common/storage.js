export function getLocalStorageValueOrDefault(key, defaultValue) {
    const localStorageItem = localStorage.getItem(key);

    return localStorageItem ? JSON.parse(localStorageItem) : defaultValue;
}

export function updateValue(event, keyName) {
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

    localStorage.setItem(keyName, valueToSet);

    return valueToSet;
}
