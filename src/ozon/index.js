import {
    addGlobalStyle,
    getFirstElement,
    somePathElementEquals,
    waitForElement,
} from '../common/dom';
import { getStorageValue, setStorageValue } from '../common/storage';
import { initFavoritesMods } from './pages/favorites';
import { initProductListMods, paginatorContent } from './pages/productList';
import { initProductPageMods } from './pages/productPage';

const COMMENTS_SELECTOR = '#comments';

migrateDatabase();

function migrateDatabase() {
    const actualDBVersion = 3;

    const dbVersion = getStorageValue('dbVersion');
    if (dbVersion === actualDBVersion) return;

    const filterCondition = (key) => key.endsWith('-lp');

    const priceKeys = window.GM_listValues()
        .filter(filterCondition);
    priceKeys.forEach((key) => {
        const object = getStorageValue(key);
        const { value } = object;
        if (value === 0) {
            console.log(key);
            console.log(value);
            window.GM_deleteValue(key);
        }
    });

    setStorageValue('dbVersion', actualDBVersion);
}

hideUnwantedElements();

function hideUnwantedElements() {
    const css =
        '[data-widget="bigPromoPDP"],' +
        '[data-widget="blackFridayStatus"],' +
        '[data-widget="cellList"],' +
        '[data-widget="skuGrid"],' +
        '[data-widget="skuShelfGoods"],' +
        '[data-widget="tagList"],' +
        '[data-widget="webInstallmentPurchase"],' +
        '[data-widget="webOneClickButton"] {' +
        '   display: none !important;' +
        '}';

    addGlobalStyle(css);
}

waitForElement(document, '.vsc-initialized')
    .then((initializedBody) => {
        if (!initializedBody) return;

        initMods();
    });

function initMods() {
    replaceFavoritesLink();

    if (paginatorContent) {
        initProductListMods();
    } else if (somePathElementEquals('reviews')) {
        const comments = getFirstElement(COMMENTS_SELECTOR);
        if (comments) comments.scrollIntoView();
    } else if (somePathElementEquals('product')) {
        initProductPageMods();
    } else if (somePathElementEquals('favorites')) {
        initFavoritesMods();
    }
}

function replaceFavoritesLink() {
    waitForElement(document, '[data-widget="favoriteCounter"]')
        .then((favoritesLink) => {
            favoritesLink.href += '?avail=inStock';
        });
}
