import {
    createCheckboxFilterControl,
    createNumberFilterControl,
    createTextFilterControl,
} from './genericControls';

export function createSearchFilterControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
) {
    return createTextFilterControl(
        'Поиск: ',
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
    inputMin = 3.0,
) {
    return createNumberFilterControl(
        'Мин. рейтинг: ',
        inputValue,
        inputStep,
        inputMin,
        5.0,
        controlStyle,
        inputStyle,
    );
}

export function createMaxRatingFilterControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
    inputStep = 0.1,
    inputMin = 3.0,
) {
    return createNumberFilterControl(
        'Макс. рейтинг: ',
        inputValue,
        inputStep,
        inputMin,
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
    return createDiscountFilterControl(
        'Мин. скидка: ',
        inputValue,
        controlStyle,
        inputStyle,
    );
}

export function createDiscountFilterControl(
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

export function createMinPriceFilterControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
    inputStep = '25',
) {
    return createPriceFilterControl(
        'Мин. цена: ', inputValue, controlStyle, inputStyle, inputStep,
    );
}

export function createMaxPriceFilterControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
    inputStep = '25',
) {
    return createPriceFilterControl(
        'Макс. цена: ', inputValue, controlStyle, inputStyle, inputStep,
    );
}

export function createMinLikesFilterControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
) {
    return createLikesFilterControl(
        'Мин. лайков: ',
        inputValue,
        controlStyle,
        inputStyle,
    );
}

export function createLikesFilterControl(
    labelText,
    inputValue,
    controlStyle = {},
    inputStyle = {},
) {
    return createNumberFilterControl(
        labelText,
        inputValue,
        '1',
        '0',
        '99999',
        controlStyle,
        inputStyle,
    );
}

export function createCardsPerRowControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
) {
    return createNumberFilterControl(
        'Колонок: ',
        inputValue,
        '1',
        '2',
        '7',
        controlStyle,
        inputStyle,
    );
}

export function createMaxNameLinesControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
) {
    return createNumberFilterControl(
        'Строк имени: ',
        inputValue,
        1,
        1,
        10,
        controlStyle,
        inputStyle,
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

export function createHasPhotoFilterControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
) {
    return createCheckboxFilterControl(
        'С фото: ',
        inputValue,
        controlStyle,
        inputStyle,
    );
}

export function createWaitFullLoadFilterControl(
    inputValue,
    controlStyle = {},
    inputStyle = {},
) {
    return createCheckboxFilterControl(
        'Прогрузка: ',
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
