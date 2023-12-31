import { getInputValueFromEvent, InputValueBase, parseValue } from './dom';

const storage = localStorage;

function getStorageValueOrDefault(key, defaultValue) {
    const localStorageItem = storage.getItem(key);

    return localStorageItem === null ? defaultValue : parseValue(localStorageItem);
}

export class StorageValue extends InputValueBase {
    constructor(storageKey, defaultValue = null, onChange = null) {
        super(getStorageValueOrDefault(storageKey, defaultValue), onChange);
        this.storageKey = storageKey;
    }

    updateValueFromEvent = (event) => {
        const newValue = getInputValueFromEvent(event);
        const newParsedValue = parseValue(newValue);

        if (this.value === newParsedValue) return;

        storage.setItem(this.storageKey, newValue);

        this.value = newParsedValue;
        this.onChangeIfDefined();
    };
}
