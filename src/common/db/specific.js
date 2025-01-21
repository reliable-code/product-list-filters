import { getStorageValue, setStorageValue } from '../storage';
import { RatedProductData as ProductData } from '../models/ratedProductData';
import { getDateMonthsAgo } from '../dateUtils';
import { processEntriesByKeyFilter } from './generic';

export const STORAGE_KEYS = {
    LAST_RATE_UPDATE: 'last-rate-update',
    REVIEWS_LAST_PRODUCT_ARTICLE: 'reviews-last-product-article',
};

export function setStoredRating(productArticle, ratingValue) {
    const productStorageKey = getProductStorageKey(productArticle);
    const storedProduct = getStorageValue(productStorageKey);
    const currentProduct = getCurrentProduct(storedProduct);

    currentProduct.rating = ratingValue;
    currentProduct.updateLastCheckDate();

    setStorageValue(productStorageKey, currentProduct);
    setStorageValue(STORAGE_KEYS.LAST_RATE_UPDATE, Date.now());
}

function getProductStorageKey(productArticle) {
    return `product-${productArticle}`;
}

function getCurrentProduct(storedProduct) {
    return storedProduct ? ProductData.fromObject(storedProduct) : new ProductData();
}

function getStoredProduct(productArticle) {
    const productStorageKey = getProductStorageKey(productArticle);
    return getStorageValue(productStorageKey);
}

export function getStoredRating(productArticle) {
    const storedProduct = getStoredProduct(productArticle);
    return storedProduct?.rating ?? null;
}

export function setReviewsLastProductArticle(productArticle) {
    return setStorageValue(STORAGE_KEYS.REVIEWS_LAST_PRODUCT_ARTICLE, productArticle);
}

export function getReviewsLastProductArticle() {
    return getStorageValue(STORAGE_KEYS.REVIEWS_LAST_PRODUCT_ARTICLE);
}

export function deleteStaleProductEntries() {
    const keyFilterCondition = (key) => key.startsWith('product-');

    const lastCheckDates = [];

    const processEntry = (key, value) => {
        const lastCheckDate = new Date(value.lastCheckDate);
        if (lastCheckDate < getDateMonthsAgo(9)) {
            lastCheckDates.push(value.lastCheckDate);
            // window.GM_deleteValue(key);
        }
    };

    processEntriesByKeyFilter(keyFilterCondition, processEntry, false);

    const sortedLastCheckDates = [...lastCheckDates]
        .sort((a, b) => new Date(a) - new Date(b));

    sortedLastCheckDates.forEach((lastCheckDate) => {
        console.log(new Date(lastCheckDate).toLocaleDateString());
    });
}
