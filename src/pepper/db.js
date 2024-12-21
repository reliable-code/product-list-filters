import { getStorageValue, setStorageValue } from '../common/storage/storage';

export function setNewestSeenProductId(productId) {
    setStorageValue('newest-seen-product-id', productId);
}

export function getNewestSeenProductId() {
    return getStorageValue('newest-seen-product-id');
}

export function setPrevNewestSeenProductId(productId) {
    setStorageValue('prev-newest-seen-product-id', productId);
}

export function getPrevNewestSeenProductId() {
    return getStorageValue('prev-newest-seen-product-id');
}
