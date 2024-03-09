import { getFirstElement } from '../common/dom';
import { getStorageValue, setStorageValue } from '../common/storage';
import {
    initAppendStoredPriceValues as initAppendFavoritesStoredPriceValues,
} from './favoritesList';
import { initListClean, paginatorContent } from './productList';
import { appendAdditionalProductPageControls } from './productPage';

const COMMENTS_SELECTOR = '#comments';

function migrateDatabase() {
    const newDBVersion = 2;
    const filterCondition = (key) => true;

    const dbVersion = getStorageValue('dbVersion');
    if (dbVersion === newDBVersion) return;

    const priceKeys = window.GM_listValues()
        .filter(filterCondition);
    priceKeys.forEach((key) => {
        const value = getStorageValue(key);
        console.log(value);
    });

    setStorageValue('dbVersion', newDBVersion);
}

const comments = getFirstElement(COMMENTS_SELECTOR);

if (paginatorContent) {
    initListClean();
} else if (comments) {
    comments.scrollIntoView();
} else if (isFavoritesPage()) {
    initAppendFavoritesStoredPriceValues();
} else {
    appendAdditionalProductPageControls();
}

function isFavoritesPage() {
    return window.location.pathname.includes('favorites');
}
