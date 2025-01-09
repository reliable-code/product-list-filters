import { processEntriesByKeyFilter, runMigrationTaskIfNeeded } from '../../common/db';
import { getStorageValue, setStorageValue } from '../../common/storage/storage';
import { RatedProductData as ProductData } from '../../common/models/ratedProductData';

const ACTUAL_DB_VERSION = 6;

export function runMigration() {
    runMigrationTaskIfNeeded(migrationTask, ACTUAL_DB_VERSION, false);
}

function migrationTask() {
    const keyFilterCondition = (key) => key.startsWith('product-');
    const processEntry = (key, value) => {
        updateProductLastCheckDate(key, 'lastCheckDate', value);
        updateProductPriceDate(key, 'lowestPrice', value);
        updateProductPriceDate(key, 'highestPrice', value);
    };

    processEntriesByKeyFilter(keyFilterCondition, processEntry, true);
}

function updateProductLastCheckDate(entryKey, productPropKey, value) {
    const lastCheckDate = value[productPropKey];

    if (lastCheckDate) {
        const [day, month, year] = lastCheckDate.split('.')
            .map(Number);
        const dateObject = new Date(year, month - 1, day);
        const timestamp = dateObject.getTime();
        value[productPropKey] = timestamp;

        setStorageValue(entryKey, value);
    }
}

function updateProductPriceDate(entryKey, productPropKey, value) {
    const datedPrice = value[productPropKey];

    if (datedPrice) {
        const dateString = datedPrice.date;
        const [day, month, year] = dateString.split('.')
            .map(Number);
        const dateObject = new Date(year, month - 1, day);
        const timestamp = dateObject.getTime();
        datedPrice.date = timestamp;

        value[productPropKey] = datedPrice;
        setStorageValue(entryKey, value);
    }
}

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
