import { InputValueBase } from './inputValueBase';
import { getInputValueFromEvent, parseValue } from '../../dom/helpers';

export class InputValue extends InputValueBase {
    constructor(defaultValue = null, onChange = null) {
        super(defaultValue, onChange);
    }

    updateValueFromEvent = (event) => {
        const newParsedValue = parseValue(getInputValueFromEvent(event));

        if (this.value === newParsedValue) return;

        this.value = newParsedValue;
        this.onChangeIfDefined();
    };
}
