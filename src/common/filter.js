import {
 createCheckboxInput, createDiv, createNumberInput, getFirstElement,
} from './dom';

export function createFilterControlNumber(
    titleText,
    inputValue,
    inputStep,
    inputMinValue,
    inputMaxValue,
    controlStyle = null,
    inputStyle = null,
) {
    const filterControl = createDiv(titleText, controlStyle);
    const input = createNumberInput(
        inputValue.updateValueFromEvent,
        inputStyle,
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
    const filterControl =
        createDiv(titleText, controlStyle);
    const input =
        createCheckboxInput(inputValue.updateValueFromEvent, inputStyle, inputValue.value);

    filterControl.append(input);

    return filterControl;
}

export function createMinRatingFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        'Минимальный рейтинг: ',
        inputValue,
        '0.1',
        '3.0',
        '5.0',
        controlStyle,
        inputStyle,
    );
}

export function createMinReviewsFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createReviewsFilterControl(
        'Минимально отзывов: ',
        inputValue,
        controlStyle,
        inputStyle,
    );
}

export function createMaxReviewsFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createReviewsFilterControl(
        'Максимально отзывов: ',
        inputValue,
        controlStyle,
        inputStyle,
    );
}

export function createReviewsFilterControl(
    titleText,
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        titleText,
        inputValue,
        '1',
        '1',
        '999999',
        controlStyle,
        inputStyle,
    );
}

export function createMinDiscountFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        'Минимальная скидка: ',
        inputValue,
        '1',
        '0',
        '100',
        controlStyle,
        inputStyle,
    );
}

export function createMinVotesFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        'Минимально голосов: ',
        inputValue,
        '50',
        '0',
        '10000',
        controlStyle,
        inputStyle,
    );
}

export function createMinCashbackFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        'Минимальный кешбек: ',
        inputValue,
        '5',
        '0',
        '100',
        controlStyle,
        inputStyle,
    );
}

export function createMaxPriceFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        'Максимальная цена: ',
        inputValue,
        '500',
        '0',
        '1000000',
        controlStyle,
        inputStyle,
    );
}

export function createNoRatingFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlCheckbox(
        'Без рейтинга: ',
        inputValue,
        controlStyle,
        inputStyle,
    );
}

export function createEnabledFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlCheckbox(
        'Вкл: ',
        inputValue,
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

export function isLessThanFilter(parameterValue, filter) {
    return filter.value && parameterValue < filter.value;
}

export function isGreaterThanFilter(parameterValue, filter) {
    return filter.value && parameterValue > filter.value;
}
