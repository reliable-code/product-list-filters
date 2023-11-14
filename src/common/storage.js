import { getInputValueFromEvent } from './dom';
const storage = localStorage;

export function getStorageValueOrDefault(key, defaultValue) {
    const localStorageItem = storage.getItem(key);

    return localStorageItem ? JSON.parse(localStorageItem) : defaultValue;
}

export function setStorageValueFromEvent(event, keyName) {
    const valueToSet = getInputValueFromEvent(event);

    storage.setItem(keyName, valueToSet);

    return valueToSet;
}

export class StorageValue {
    constructor(storageKey, defaultValue = null, onChange = null) {
        this.value = getStorageValueOrDefault(storageKey, defaultValue);
        this.storageKey = storageKey;
        this.onChange = onChange;
    }

    updateValueFromEvent = (event) => {
        this.value = setStorageValueFromEvent(event, this.storageKey);
        if (this.onChange) this.onChange();
    };
}
