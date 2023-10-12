import {
 createCheckboxInput, createDiv, createNumberInput, getFirstElement,
} from './dom';

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
    const input = createCheckboxInput(inputOnChange, inputStyle, isChecked);

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
    storageValue,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlNumber(
        'Минимальная скидка: ',
        storageValue.value,
        '1',
        '0',
        '100',
        storageValue.updateValueFromEvent,
        controlStyle,
        inputStyle,
    );
}

export function createMinVotesFilterControl(
    inputValue,
    inputOnChange,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlNumber(
        'Минимально голосов: ',
        inputValue,
        '50',
        '0',
        '10000',
        inputOnChange,
        controlStyle,
        inputStyle,
    );
}

export function createNoRatingFilterControl(
    storageValue,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlCheckbox(
        'Без рейтинга: ',
        storageValue.value,
        storageValue.updateValueFromEvent,
        controlStyle,
        inputStyle,
    );
}

export function createEnabledFilterControl(
    isChecked,
    inputOnChange,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlCheckbox(
        'Вкл: ',
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
