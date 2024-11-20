import { processAllEntries, runMigrationTaskIfNeeded } from '../../common/db/db';
import { getStorageValue, setStorageValue } from '../../common/storage/storage';
import { RatedProductData as ProductData } from '../../common/models/ratedProductData';

const ACTUAL_DB_VERSION = 5;

export function runMigration() {
    runMigrationTaskIfNeeded(migrationTask, ACTUAL_DB_VERSION, false);
}

function migrationTask() {
    // const keyFilterCondition = (key) => key.includes('filter');
    const processEntry = (key, value) => {
        if (key.endsWith('-lp')) {
            updateProduct(key, 'lowestPrice', value);
        }
        if (key.endsWith('-hp')) {
            updateProduct(key, 'highestPrice', value);
        }
        if (key.endsWith('-rate')) {
            updateProduct(key, 'rating', value);
        }
    };

    processAllEntries(processEntry, true);
}

function updateProduct(entryKey, productPropKey, value) {
    const [productId] = entryKey.split('-');

    const productStorageKey = `product-${productId}`;
    const storedProduct = getStorageValue(productStorageKey);

    const currentProduct =
        storedProduct ? ProductData.fromObject(storedProduct) : new ProductData();

    currentProduct[productPropKey] = value;

    setStorageValue(productStorageKey, currentProduct);

    window.GM_deleteValue(entryKey);
}

export function setStoredRatingValue(productArticle, ratingValue) {
    const productStorageKey = getProductStorageKey(productArticle);
    const storedProduct = getStorageValue(productStorageKey);

    const currentProduct =
        storedProduct ? ProductData.fromObject(storedProduct) : new ProductData();
    currentProduct.rating = ratingValue;

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
