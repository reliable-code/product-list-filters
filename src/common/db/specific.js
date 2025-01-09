import { getStorageValue, setStorageValue } from '../storage';
import { RatedProductData as ProductData } from '../models/ratedProductData';

const STORAGE_KEYS = {
    LAST_RATE_UPDATE: 'last-rate-update',
    REVIEWS_LAST_PRODUCT_ARTICLE: 'reviews-last-product-article',
};

export function setStoredRatingValue(productArticle, ratingValue) {
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

function getStoredProductValue(productArticle) {
    const productStorageKey = getProductStorageKey(productArticle);
    return getStorageValue(productStorageKey);
}

export function getStoredRatingValue(productArticle) {
    const storedProduct = getStoredProductValue(productArticle);
    return storedProduct?.rating ?? null;
}

export function setReviewsLastProductArticle(productArticle) {
    return setStorageValue(STORAGE_KEYS.REVIEWS_LAST_PRODUCT_ARTICLE, productArticle);
}

export function getReviewsLastProductArticle() {
    return getStorageValue(STORAGE_KEYS.REVIEWS_LAST_PRODUCT_ARTICLE);
}
