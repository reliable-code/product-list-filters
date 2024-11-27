import {
    createCheckboxInput,
    createDiv,
    createNumberInput,
    createTextInput,
} from '../../dom/factories/elements';

export function createTextFilterControl(
    labelText,
    inputValue,
    controlStyle = {},
    inputStyle = {},
) {
    const filterControl = createDiv(controlStyle, labelText);
    const input = createTextInput(
        inputStyle,
        inputValue.updateValueFromEvent,
        inputValue.value,
    );

    filterControl.append(input);

    return filterControl;
}

export function createNumberFilterControl(
    labelText,
    inputValue,
    inputStep,
    inputMin,
    inputMax,
    controlStyle = {},
    inputStyle = {},
) {
    const filterControl = createDiv(controlStyle, labelText);
    const input = createNumberInput(
        inputStyle,
        inputValue.updateValueFromEvent,
        inputValue.value,
        inputStep,
        inputMin,
        inputMax,
    );

    filterControl.append(input);

    return filterControl;
}

export function createCheckboxFilterControl(
    labelText,
    inputValue,
    controlStyle = {},
    inputStyle = {},
) {
    const filterControl = createDiv(controlStyle, labelText);
    const input = createCheckboxInput(
        inputStyle, inputValue.updateValueFromEvent, inputValue.value,
    );

    filterControl.append(input);

    return filterControl;
}
