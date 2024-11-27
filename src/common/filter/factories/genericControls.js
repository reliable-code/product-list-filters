import {
    createCheckboxInput,
    createDiv,
    createNumberInput,
    createTextInput,
} from '../../dom/factories/elements';
import { styleStringToObject } from '../../dom/helpers';

export function createFilterControlText(
    titleText,
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    const filterControl = createDiv(controlStyle, titleText);
    const input = createTextInput(
        inputStyle,
        inputValue.updateValueFromEvent,
        inputValue.value,
    );

    filterControl.append(input);

    return filterControl;
}

export function createFilterControlNumber(
    titleText,
    inputValue,
    inputStep,
    inputMinValue,
    inputMaxValue,
    controlStyle = null,
    inputStyle = null,
) {
    const controlStyleObj = styleStringToObject(controlStyle);
    const inputStyleObj = styleStringToObject(inputStyle);
    const filterControl = createDiv(controlStyleObj, titleText);
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
    titleText,
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    const controlStyleObj = styleStringToObject(controlStyle);
    const inputStyleObj = styleStringToObject(inputStyle);
    const filterControl = createDiv(controlStyleObj, titleText);
    const input = createCheckboxInput(
        inputStyleObj, inputValue.updateValueFromEvent, inputValue.value,
    );

    filterControl.append(input);

    return filterControl;
}
