import { getStorageValue, setStorageValue } from '../common/storage/storage';

export function setNewestSeenProductId(productId) {
    setStorageValue('newest-seen-product-id', productId);
}

export function getNewestSeenProductId() {
    return getStorageValue('newest-seen-product-id');
}
