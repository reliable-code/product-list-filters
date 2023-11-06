import {
 createCheckboxInput, createDiv, createNumberInput, getFirstElement,
} from './dom';

export function createFilterControlNumber(
    titleText,
    storageValue,
    inputStep,
    inputMinValue,
    inputMaxValue,
    controlStyle = null,
    inputStyle = null,
) {
    const filterControl = createDiv(titleText, controlStyle);
    const input = createNumberInput(
        storageValue.updateValueFromEvent,
        inputStyle,
        storageValue.value,
        inputStep,
        inputMinValue,
        inputMaxValue,
    );

    filterControl.append(input);

    return filterControl;
}

export function createFilterControlCheckbox(
    titleText,
    storageValue,
    controlStyle = null,
    inputStyle = null,
) {
    const filterControl =
        createDiv(titleText, controlStyle);
    const input =
        createCheckboxInput(storageValue.updateValueFromEvent, inputStyle, storageValue.value);

    filterControl.append(input);

    return filterControl;
}

export function createMinRatingFilterControl(
    storageValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        'Минимальный рейтинг: ',
        storageValue,
        '0.1',
        '3.0',
        '5.0',
        controlStyle,
        inputStyle,
    );
}

export function createMinReviewsFilterControl(
    storageValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        'Минимально отзывов: ',
        storageValue,
        '1',
        '1',
        '999999',
        controlStyle,
        inputStyle,
    );
}

export function createMinDiscountFilterControl(
    storageValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        'Минимальная скидка: ',
        storageValue,
        '1',
        '0',
        '100',
        controlStyle,
        inputStyle,
    );
}

export function createMinVotesFilterControl(
    storageValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        'Минимально голосов: ',
        storageValue,
        '50',
        '0',
        '10000',
        controlStyle,
        inputStyle,
    );
}

export function createMinCashbackFilterControl(
    storageValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        'Минимальный кешбек: ',
        storageValue,
        '5',
        '0',
        '100',
        controlStyle,
        inputStyle,
    );
}

export function createMaxPriceFilterControl(
    storageValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        'Максимальная цена: ',
        storageValue,
        '100',
        '0',
        '1000000',
        controlStyle,
        inputStyle,
    );
}

export function createNoRatingFilterControl(
    storageValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlCheckbox(
        'Без рейтинга: ',
        storageValue,
        controlStyle,
        inputStyle,
    );
}

export function createEnabledFilterControl(
    storageValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlCheckbox(
        'Вкл: ',
        storageValue,
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
