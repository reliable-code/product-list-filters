import { getElementInnerNumber, getFirstElement } from '../../../common/dom/dom';
import { getStorageValue, setStorageValue } from '../../../common/storage';
import { ProductData } from '../../../common/models/productData';

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

