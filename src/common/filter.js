import {
    createCheckboxInput,
    createDiv,
    createNumberInput,
    createTextInput,
    getFirstElement,
} from './dom';

export function createFilterControlText(
    titleText,
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    const filterControl = createDiv(titleText, controlStyle);
    const input = createTextInput(
        inputValue.updateValueFromEvent,
        inputStyle,
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

export function createNameFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlText(
        'Содержит: ',
        inputValue,
        controlStyle,
        inputStyle,
    );
}

export function createMinRatingFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
    inputStep = 0.1,
) {
    return createFilterControlNumber(
        'Мин. рейтинг: ',
        inputValue,
        inputStep,
        3.0,
        5.0,
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
        'Мин. отзывов: ',
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
        'Макс. отзывов: ',
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
    return createDiscountFilterControlBase(
        'Мин. скидка: ',
        inputValue,
        controlStyle,
        inputStyle,
    );
}

export function createDiscountFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createDiscountFilterControlBase(
        'Скидка: ',
        inputValue,
        controlStyle,
        inputStyle,
    );
}

function createDiscountFilterControlBase(
    titleText,
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        titleText,
        inputValue,
        '5',
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
        'Макс. цена: ',
        inputValue,
        '250',
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
    force = false,
    filtersContainerId = 'customFiltersContainer',
) {
    let filtersContainer = getFirstElement(`#${filtersContainerId}`, parentNode);

    if (filtersContainer) {
        if (force) {
            filtersContainer.remove();
        } else {
            return;
        }
    }

    filtersContainer = createDiv();
    filtersContainer.id = filtersContainerId;

    appendFiltersContainerFunc(filtersContainer, parentNode);
}

export function isNotMatchTextFilter(parameterValue, filter) {
    return !isMatchTextFilter(parameterValue, filter);
}

function isMatchTextFilter(parameterValue, filter) {
    if (!filter.value) return true;

    const comparedString = parameterValue.toLowerCase();
    const searchStrings = filter.value.toLowerCase()
        .split(',')
        .map((searchString) => searchString.trim());

    const {
        include: includeSearchStrings,
        notInclude: notIncludeSearchStrings,
    } =
        searchStrings.reduce((result, searchString) => {
            if (!searchString.startsWith('!')) {
                result.include.push(searchString);
            } else {
                const notIncludeSearchString = searchString.substring(1);
                if (notIncludeSearchString.length) result.notInclude.push(notIncludeSearchString);
            }
            return result;
        }, {
            include: [],
            notInclude: [],
        });

    return includeSearchStrings.every((searchString) => comparedString.includes(searchString)) &&
        notIncludeSearchStrings.every((searchString) => !comparedString.includes(searchString));
}

export function isLessThanFilter(parameterValue, filter) {
    return filter.value && parameterValue < filter.value;
}

export function isGreaterThanFilter(parameterValue, filter) {
    return filter.value && parameterValue > filter.value;
}
