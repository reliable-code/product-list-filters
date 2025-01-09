import { getStorageValue, setStorageValue } from '../storage';
import { RatedProductData as ProductData } from '../models/ratedProductData';

export function setStoredRatingValue(productArticle, ratingValue) {
    const productStorageKey = getProductStorageKey(productArticle);
    const storedProduct = getStorageValue(productStorageKey);
    const currentProduct = getCurrentProduct(storedProduct);

    currentProduct.rating = ratingValue;
    currentProduct.updateLastCheckDate();

    setStorageValue(productStorageKey, currentProduct);
    setStorageValue('last-rate-update', Date.now());
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
    return setStorageValue('reviews-last-product-article', productArticle);
}

export function getReviewsLastProductArticle() {
    return getStorageValue('reviews-last-product-article');
}
