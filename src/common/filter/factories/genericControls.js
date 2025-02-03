import {
    createCheckboxInput,
    createNumberInput,
    createTextInput,
} from '../../dom/factories/elements';
import { createControl } from '../../dom/factories/controls';

export function createTextFilterControl(
    labelText,
    inputValue,
    controlStyles = {},
    inputStyles = {},
) {
    const input = createTextInput(
        inputStyles,
        inputValue.updateValueFromEvent,
        inputValue.value,
    );

    return createControl(input, controlStyles, labelText);
}

export function createNumberFilterControl(
    labelText,
    inputValue,
    inputStep,
    inputMin,
    inputMax,
    controlStyles = {},
    inputStyles = {},
) {
    const input = createNumberInput(
        inputStyles,
        inputValue.updateValueFromEvent,
        inputValue.value,
        inputStep,
        inputMin,
        inputMax,
    );

    return createControl(input, controlStyles, labelText);
}

export function createCheckboxFilterControl(
    labelText,
    inputValue,
    controlStyles = {},
    inputStyles = {},
) {
    const input = createCheckboxInput(
        inputStyles,
        inputValue.updateValueFromEvent,
        inputValue.value,
    );

    return createControl(input, controlStyles, labelText);
}
