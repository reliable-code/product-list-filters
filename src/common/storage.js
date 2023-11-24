import { getInputValueFromEvent, InputValueBase, parseValue } from './dom';

const storage = localStorage;

function getStorageValueOrDefault(key, defaultValue) {
    const localStorageItem = storage.getItem(key);

    return localStorageItem === null ? defaultValue : parseValue(localStorageItem);
}

function setStorageValueFromEvent(event, keyName) {
    const inputValue = getInputValueFromEvent(event);

    storage.setItem(keyName, inputValue);

    return parseValue(inputValue);
}

export class StorageValue extends InputValueBase {
    constructor(storageKey, defaultValue = null, onChange = null) {
        super(getStorageValueOrDefault(storageKey, defaultValue), onChange);
        this.storageKey = storageKey;
    }

    updateValueFromEvent = (event) => {
        this.value = setStorageValueFromEvent(event, this.storageKey);
        this.onChangeIfDefined();
    };
}
