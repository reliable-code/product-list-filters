import { styleStringToObject } from '../../dom/helpers';
import {
    createFilterControlCheckbox,
    createFilterControlNumber,
    createFilterControlText,
} from './genericControls';

export function createNameFilterControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
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
    controlStyle = {},
    inputStyle = {},
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
    labelText,
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        labelText,
        inputValue,
        '1',
        '1',
        '999999',
        styleStringToObject(controlStyle),
        styleStringToObject(inputStyle),
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
    labelText,
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        labelText,
        inputValue,
        '5',
        '0',
        '100',
        styleStringToObject(controlStyle),
        styleStringToObject(inputStyle),
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
        styleStringToObject(controlStyle),
        styleStringToObject(inputStyle),
    );
}

export function createMinCashbackFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlNumber(
        'Мин. кешбек: ',
        inputValue,
        '5',
        '0',
        '100',
        styleStringToObject(controlStyle),
        styleStringToObject(inputStyle),
    );
}

function createPriceFilterControlBase(labelText, inputValue, controlStyle, inputStyle, inputStep) {
    return createFilterControlNumber(
        labelText,
        inputValue,
        inputStep,
        '0',
        '1000000',
        styleStringToObject(controlStyle),
        styleStringToObject(inputStyle),
    );
}

export function createCouponValueControl(inputValue, controlStyle, inputStyle) {
    return createFilterControlNumber(
        'Купон: ',
        inputValue,
        '500',
        '0',
        '100000',
        styleStringToObject(controlStyle),
        styleStringToObject(inputStyle),
    );
}

export function createMaxPriceFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
    inputStep = '250',
) {
    return createPriceFilterControlBase(
        'Макс. цена: ', inputValue, controlStyle, inputStyle, inputStep,
    );
}

export function createMaxDiscountedPriceFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createPriceFilterControlBase(
        'Макс. цена со скидкой: ', inputValue, controlStyle, inputStyle, '250',
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
        styleStringToObject(controlStyle),
        styleStringToObject(inputStyle),
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
        styleStringToObject(controlStyle),
        styleStringToObject(inputStyle),
    );
}
