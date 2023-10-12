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
    storageValue,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlNumber(
        'Минимальный рейтинг: ',
        storageValue.value,
        '0.1',
        '3.0',
        '5.0',
        storageValue.updateValueFromEvent,
        controlStyle,
        inputStyle,
    );
}

export function createMinReviewsFilterControl(
    storageValue,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlNumber(
        'Минимально отзывов: ',
        storageValue.value,
        '1',
        '1',
        '999999',
        storageValue.updateValueFromEvent,
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
    storageValue,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlNumber(
        'Минимально голосов: ',
        storageValue.value,
        '50',
        '0',
        '10000',
        storageValue.updateValueFromEvent,
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
    storageValue,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlCheckbox(
        'Вкл: ',
        storageValue.value,
        storageValue.updateValueFromEvent,
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
