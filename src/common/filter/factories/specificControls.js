import {
    createCheckboxFilterControl,
    createNumberFilterControl,
    createTextFilterControl,
} from './genericControls';

export function createNameFilterControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
) {
    return createTextFilterControl(
        'Содержит: ',
        inputValue,
        controlStyle,
        inputStyle,
    );
}

export function createMinRatingFilterControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
    inputStep = 0.1,
) {
    return createNumberFilterControl(
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
    controlStyle = {},
    inputStyle = {},
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
    controlStyle = {},
    inputStyle = {},
) {
    return createReviewsFilterControl(
        'Макс. отзывов: ',
        inputValue,
        controlStyle,
        inputStyle,
    );
}

function createReviewsFilterControl(
    labelText,
    inputValue,
    controlStyle = {},
    inputStyle = {},
) {
    return createNumberFilterControl(
        labelText,
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
    controlStyle = {},
    inputStyle = {},
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
    controlStyle = {},
    inputStyle = {},
) {
    return createDiscountFilterControlBase(
        'Скидка: ',
        inputValue,
        controlStyle,
        inputStyle,
    );
}

export function createDiscountFilterControlBase(
    labelText,
    inputValue,
    controlStyle = {},
    inputStyle = {},
) {
    return createNumberFilterControl(
        labelText,
        inputValue,
        '5',
        '0',
        '100',
        controlStyle,
        inputStyle,
    );
}

export function createMinCashbackFilterControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
) {
    return createNumberFilterControl(
        'Мин. кешбек: ',
        inputValue,
        '5',
        '0',
        '100',
        controlStyle,
        inputStyle,
    );
}

export function createPriceFilterControl(
    labelText,
    inputValue,
    controlStyle = {},
    inputStyle = {},
    inputStep = '250',
) {
    return createNumberFilterControl(
        labelText,
        inputValue,
        inputStep,
        '0',
        '1000000',
        controlStyle,
        inputStyle,
    );
}

export function createMaxPriceFilterControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
    inputStep = '250',
) {
    return createPriceFilterControl(
        'Макс. цена: ', inputValue, controlStyle, inputStyle, inputStep,
    );
}

export function createNoRatingFilterControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
) {
    return createCheckboxFilterControl(
        'Без рейтинга: ',
        inputValue,
        controlStyle,
        inputStyle,
    );
}

export function createEnabledFilterControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
) {
    return createCheckboxFilterControl(
        'Вкл: ',
        inputValue,
        controlStyle,
        inputStyle,
    );
}
