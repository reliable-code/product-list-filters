import { getStorageValue, setStorageValue } from '../../../common/storage/storage';
import { ProductData } from '../../../common/models/productData';
import { DatedValue } from '../../../common/models/datedValue';
import { PriceData } from '../../../common/models/priceData';
import { appendStoredPriceValue } from '../../../common/dom/elementsFactory';
import { getElementInnerNumber, getFirstElement } from '../../../common/dom/helpers';

const INPUT_STYLE =
    'margin-left: 4px;';
export const NUMBER_INPUT_STYLE =
    INPUT_STYLE + // eslint-disable-line prefer-template
    'width: 60px;';
export const TEXT_INPUT_STYLE =
    INPUT_STYLE + // eslint-disable-line prefer-template
    'width: 180px;';
export const CONTROL_STYLE =
    'display: flex;' +
    'align-items: center;';
export const CHECKBOX_INPUT_STYLE =
    'margin-left: 5px;' +
    'width: 25px;' +
    'height: 25px;';

export function setCommonFiltersContainerStyles(filtersContainer) {
    filtersContainer.style =
        'display: flex;' +
        'grid-gap: 15px;' +
        'margin-top: 14px;';
}

export function appendPriceHistory(priceContainer, priceSelector, productArticle) {
    const priceSpan = getFirstElement(priceSelector, priceContainer);
    const currentPriceValue = getElementInnerNumber(priceSpan, true);

    const productStorageKey = `product-${productArticle}`;
    const storedProduct = getStorageValue(productStorageKey);

    let currentProduct =
        storedProduct ? ProductData.fromObject(storedProduct) : new ProductData();

    const lowestPriceKey = 'lowestPrice';
    const highestPriceKey = 'highestPrice';

    currentProduct = updateAndAppendStoredPriceValue(
        currentProduct,
        lowestPriceKey,
        (storedPrice) => currentPriceValue <= storedPrice.value,
        currentPriceValue,
        'Мин. цена',
        '#d6f5b1',
        priceContainer,
    );

    currentProduct = updateAndAppendStoredPriceValue(
        currentProduct,
        highestPriceKey,
        (storedPrice) => currentPriceValue >= storedPrice.value,
        currentPriceValue,
        'Макс. цена',
        '#fed2ea',
        priceContainer,
    );

    currentProduct.updateLastCheckDate();

    setStorageValue(productStorageKey, currentProduct);

    const priceData =
        new PriceData(
            currentPriceValue,
            currentProduct.lowestPrice,
            currentProduct.highestPrice,
        );

    return priceData;
}

function updateAndAppendStoredPriceValue(
    product, priceKey, compareCondition, currentPriceValue, label, color, priceContainer,
) {
    let storedPrice = product[priceKey];

    if (!currentPriceValue) {
        if (!storedPrice) return product;
    } else if (!storedPrice || compareCondition(storedPrice)) {
        const currentPrice = new DatedValue(currentPriceValue);
        product[priceKey] = currentPrice;
        storedPrice = currentPrice;
    }

    appendStoredPriceValue(label, storedPrice, color, priceContainer);

    return product;
}
