import { getStorageValue, setStorageValue } from '../../../common/storage/storage';
import { ProductData } from '../../../common/models/productData';
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

