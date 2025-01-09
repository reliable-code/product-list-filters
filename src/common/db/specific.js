import { getStorageValue, setStorageValue } from '../storage';
import { RatedProductData as ProductData } from '../models/ratedProductData';

export function setStoredRatingValue(productArticle, ratingValue) {
    const productStorageKey = getProductStorageKey(productArticle);
    const storedProduct = getStorageValue(productStorageKey);

    const currentProduct =
        storedProduct ? ProductData.fromObject(storedProduct) : new ProductData();

    currentProduct.rating = ratingValue;
    currentProduct.updateLastCheckDate();

    setStorageValue(productStorageKey, currentProduct);
    setStorageValue('last-rate-update', Date.now());
}

export function getStoredRatingValue(productArticle) {
    const storedProduct = getStoredProductValue(productArticle);
    return storedProduct?.rating ?? null;
}

function getStoredProductValue(productArticle) {
    const productStorageKey = getProductStorageKey(productArticle);
    return getStorageValue(productStorageKey);
}

function getProductStorageKey(productArticle) {
    return `product-${productArticle}`;
}

export function setReviewsLastProductArticle(productArticle) {
    return setStorageValue('reviews-last-product-article', productArticle);
}

export function getReviewsLastProductArticle() {
    return getStorageValue('reviews-last-product-article');
}
