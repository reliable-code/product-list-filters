import {
    createCheckboxInput,
    createDiv,
    createNumberInput,
    createTextInput,
} from '../dom/factories/elements';
import { styleStringToObject } from '../dom/helpers';

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

export function createNameFilterControl(
    inputValue,
    controlStyle = null,
    inputStyle = null,
) {
    return createFilterControlText(
        'Содержит: ',
        inputValue,
        styleStringToObject(controlStyle),
        styleStringToObject(inputStyle),
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
        'Мин. кешбек: ',
        inputValue,
        '5',
        '0',
        '100',
        controlStyle,
        inputStyle,
    );
}

function createPriceFilterControlBase(titleText, inputValue, controlStyle, inputStyle, inputStep) {
    return createFilterControlNumber(
        titleText,
        inputValue,
        inputStep,
        '0',
        '1000000',
        controlStyle,
        inputStyle,
    );
}

export function createCouponValueControl(inputValue, controlStyle, inputStyle) {
    return createFilterControlNumber(
        'Купон: ',
        inputValue,
        '500',
        '0',
        '100000',
        controlStyle,
        inputStyle,
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
