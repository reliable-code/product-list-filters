import { InputValueBase } from './inputValueBase';
import { getInputValueFromEvent } from '../helpers';
import { parseValue } from '../utils';
import { getStorageValue, setStorageValue } from '../index';

export class StoredInputValue extends InputValueBase {
    constructor(storageKey, defaultValue = null, onChange = null) {
        super(getStorageValue(storageKey, defaultValue), onChange);
        this.storageKey = storageKey;
        this.defaultValue = defaultValue;
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

    updateValue(newValue, callOnChange = true) {
        if (this.value === newValue) return;

        setStorageValue(this.storageKey, newValue);

        this.value = newValue;
        if (callOnChange) this.onChangeIfDefined();
    }

    clearValue(callOnChange = false) {
        this.updateValue(null, callOnChange);
    }

    resetValue(callOnChange = false) {
        this.updateValue(this.defaultValue, callOnChange);
    }
}
