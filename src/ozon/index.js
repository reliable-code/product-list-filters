import {
 debounce, getFirstElement, pathnameIncludes, waitForElement,
} from '../common/dom';
import { getStorageValue, setStorageValue } from '../common/storage';
import { initFavoritesMods } from './pages/favorites';
import { initProductListMods, paginatorContent } from './pages/productList';
import { initProductPageMods } from './pages/productPage';

const COMMENTS_SELECTOR = '#comments';

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

migrateDatabase();

const comments = getFirstElement(COMMENTS_SELECTOR);

waitForElement(document, '#layoutPage')
    .then((layout) => {
        if (!layout) return;

        const observer =
            new MutationObserver(debounce(() => {
                observer.disconnect();
                initMods();
            }, 750));

        observer.observe(layout, {
            childList: true,
            subtree: true,
        });
    });

function initMods() {
    replaceFavoritesLink();

    if (paginatorContent) {
        initProductListMods();
    } else if (comments) {
        comments.scrollIntoView();
    } else if (pathnameIncludes('favorites')) {
        initFavoritesMods();
    } else {
        initProductPageMods();
    }
}

function replaceFavoritesLink() {
    waitForElement(document, '[data-widget="favoriteCounter"]')
        .then((favoritesLink) => {
            favoritesLink.href += '?avail=inStock';
        });
}
