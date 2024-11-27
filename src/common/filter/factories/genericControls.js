import {
    createCheckboxInput,
    createDiv,
    createNumberInput,
    createTextInput,
} from '../../dom/factories/elements';
import { styleStringToObject } from '../../dom/helpers';

export function createFilterControlText(
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

export function createFilterControlNumber(
    labelText,
    inputValue,
    inputStep,
    inputMinValue,
    inputMaxValue,
    controlStyle = null,
    inputStyle = null,
) {
    const controlStyleObj = styleStringToObject(controlStyle);
    const inputStyleObj = styleStringToObject(inputStyle);
    const filterControl = createDiv(controlStyleObj, labelText);
    const input = createNumberInput(
        inputStyleObj,
        inputValue.updateValueFromEvent,
        inputValue.value,
        inputStep,
        inputMinValue,
        inputMaxValue,
    );

    filterControl.append(input);

    return filterControl;
}

export function createFilterControlCheckbox(
    labelText,
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    const controlStyleObj = styleStringToObject(controlStyle);
    const inputStyleObj = styleStringToObject(inputStyle);
    const filterControl = createDiv(controlStyleObj, labelText);
    const input = createCheckboxInput(
        inputStyleObj, inputValue.updateValueFromEvent, inputValue.value,
    );

    filterControl.append(input);

    return filterControl;
}
