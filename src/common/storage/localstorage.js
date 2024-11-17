import { InputValueBase } from './models/inputValueBase';
import { getInputValueFromEvent } from './helpers';
import { parseValue } from './utils';

const storage = localStorage;

export function getStorageValueOrDefault(key, defaultValue = null) {
    const localStorageItem = storage.getItem(key);

    return localStorageItem === null ? defaultValue : parseValue(localStorageItem);
}

export class StoredInputValue extends InputValueBase {
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
