import { InputValueBase } from './models/inputValueBase';
import { getInputValueFromEvent } from './helpers';
import { parseValue } from './utils';

export const setStorageValue = window.GM_setValue;
export const setStorageValueAsync = window.GM.setValue;
export const getStorageValue = window.GM_getValue;
export const addStorageValueListener = window.GM_addValueChangeListener;

export class StoredInputValue extends InputValueBase {
    constructor(storageKey, defaultValue = null, onChange = null) {
        super(getStorageValue(storageKey, defaultValue), onChange);
        this.storageKey = storageKey;
    }

    static create(storageKey, defaultValue = null, onChange = null) {
        return new StoredInputValue(storageKey, defaultValue, onChange);
    }

    static createWithCompositeKey(keyPrefix, keySuffix, defaultValue = null, onChange = null) {
        const storageKey = `${keyPrefix}-${keySuffix}`;
        return new StoredInputValue(storageKey, defaultValue, onChange);
    }

    updateValueFromEvent = (event) => {
        const newValue = getInputValueFromEvent(event);
        const newParsedValue = parseValue(newValue);

        this.updateValue(newParsedValue);
    };

    updateValue(newValue) {
        if (this.value === newValue) return;

        setStorageValue(this.storageKey, newValue);

        this.value = newValue;
        this.onChangeIfDefined();
    }
}
