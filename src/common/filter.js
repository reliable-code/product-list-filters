import { createDiv, createInput, getFirstElement } from './dom';

function createNumberInput(
    inputOnChange, inputStyle, inputValue, inputStep, inputMinValue, inputMaxValue,
) {
    const input = createInput('number', inputOnChange, inputStyle);
    input.value = inputValue;
    input.step = inputStep;
    input.min = inputMinValue;
    input.max = inputMaxValue;

    return input;
}

export function createFilterControlNumber(
    titleText,
    inputValue,
    inputStep,
    inputMinValue,
    inputMaxValue,
    inputOnChange,
    controlStyle = '',
    inputStyle = '',
) {
    const filterControl = createDiv(titleText, controlStyle);
    const input = createNumberInput(
        inputOnChange, inputStyle, inputValue, inputStep, inputMinValue, inputMaxValue,
    );

    filterControl.append(input);

    return filterControl;
}

export function createFilterControlCheckbox(
    titleText,
    isChecked,
    inputOnChange,
    controlStyle = '',
    inputStyle = '',
) {
    const filterControl = createDiv(titleText, controlStyle);
    const input = createInput('checkbox', inputOnChange, inputStyle);

    input.checked = isChecked;

    filterControl.append(input);

    return filterControl;
}

export function createMinRatingFilterControl(
    inputValue,
    inputOnChange,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlNumber(
        'Минимальный рейтинг: ',
        inputValue,
        '0.1',
        '3.0',
        '5.0',
        inputOnChange,
        controlStyle,
        inputStyle,
    );
}

export function createMinReviewsFilterControl(
    inputValue,
    inputOnChange,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlNumber(
        'Минимально отзывов: ',
        inputValue,
        '1',
        '1',
        '999999',
        inputOnChange,
        controlStyle,
        inputStyle,
    );
}

export function createMinDiscountFilterControl(
    inputValue,
    inputOnChange,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlNumber(
        'Минимальная скидка: ',
        inputValue,
        '1',
        '0',
        '100',
        inputOnChange,
        controlStyle,
        inputStyle,
    );
}

export function createNoRatingFilterControl(
    isChecked,
    inputOnChange,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlCheckbox(
        'Без рейтинга: ',
        isChecked,
        inputOnChange,
        controlStyle,
        inputStyle,
    );
}

export function appendFilterControlsIfNeeded(
    parentNode,
    appendFiltersContainerFunc,
    filtersContainerId = 'customFiltersContainer',
) {
    let filtersContainer = getFirstElement(`#${filtersContainerId}`, parentNode);

    if (filtersContainer) {
        return;
    }

    filtersContainer = createDiv();
    filtersContainer.id = filtersContainerId;

    appendFiltersContainerFunc(filtersContainer, parentNode);
}
