import { InputValueBase } from './models/inputValueBase';
import { parseValue } from '../dom/helpers';
import { getInputValueFromEvent } from './helpers';

export const setStorageValue = window.GM_setValue;
export const getStorageValue = window.GM_getValue;
export const addStorageValueListener = window.GM_addValueChangeListener;

export class StoredInputValue extends InputValueBase {
    constructor(storageKey, defaultValue = null, onChange = null) {
        super(getStorageValue(storageKey, defaultValue), onChange);
        this.storageKey = storageKey;
    }

    updateValueFromEvent = (event) => {
        const newValue = getInputValueFromEvent(event);
        const newParsedValue = parseValue(newValue);

        if (this.value === newParsedValue) return;
        setStorageValue(this.storageKey, newParsedValue);

        this.value = newParsedValue;
        this.onChangeIfDefined();
    };
}
