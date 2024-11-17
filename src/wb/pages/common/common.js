import { getStorageValue, setStorageValue } from '../../../common/storage/storage';
import { ProductData } from '../../../common/models/productData';
import { DatedValue } from '../../../common/models/datedValue';
import { appendStoredPriceValue } from '../../../common/dom/elementsFactory';
import { getElementInnerNumber, getFirstElement } from '../../../common/dom/helpers';

export function appendPriceHistory(priceContainer, priceSelector, productArticle) {
    const priceSpan = getFirstElement(priceSelector, priceContainer);
    const currentPriceValue = getElementInnerNumber(priceSpan, true);

    const productStorageKey = `product-${productArticle}`;
    let currentProduct = getStorageValue(productStorageKey);

    if (!currentProduct) {
        currentProduct = new ProductData();
    }

    setStorageValue(productStorageKey, currentProduct);
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
