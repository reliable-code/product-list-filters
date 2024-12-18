import { waitForElement } from '../common/dom/utils';
import { initFavoritesMods } from './pages/favorites';
import { initProductListMods } from './pages/productList';
import { initProductPageMods } from './pages/productPage';
import { somePathElementEquals } from '../common/url';
import { getFirstElement } from '../common/dom/helpers';
import { runMigration as migrateDb } from './db/db';
import { initCartMods, initCheckoutMods } from './pages/checkoutPage';
import { hideUnwantedElements } from './pages/common';
import { SELECTORS } from './selectors';

migrateDb();

hideUnwantedElements();

let initModsQueue = Promise.resolve();

async function addInitModsToQueue() {
    initModsQueue = initModsQueue.then(initMods);
}

const { body } = document;

if (isBodyInitialized()) {
    await addInitModsToQueue();
} else {
    initModsAfterBodyInitialization();
}

function isBodyInitialized() {
    return body.classList.contains('vsc-initialized');
}

function initModsAfterBodyInitialization() {
    const observer = new MutationObserver(async () => {
        if (isBodyInitialized()) {
            observer.disconnect();
            await addInitModsToQueue();
        }
    });

    observer.observe(body, {
        attributes: true,
        attributeFilter: ['class'],
    });
}

async function initMods() {
    if (somePathElementEquals('gocheckout')) {
        initCheckoutMods();
        return;
    }

    if (somePathElementEquals('cart')) {
        initCartMods();
        return;
    }

    await replaceFavoritesLink();

    const paginatorContent = getFirstElement(SELECTORS.PAGINATOR_CONTENT);
    if (paginatorContent) {
        await initProductListMods(paginatorContent);
        return;
    }

    if (somePathElementEquals('reviews')) {
        const comments = getFirstElement(SELECTORS.COMMENTS);
        if (comments) comments.scrollIntoView();
        return;
    }

    if (somePathElementEquals('product')) {
        await initProductPageMods();
        return;
    }

    if (somePathElementEquals('favorites')) {
        await initFavoritesMods();
    }
}

async function replaceFavoritesLink() {
    const favoritesLink = await waitForElement(document, SELECTORS.FAVORITES_LINK);
    if (favoritesLink) favoritesLink.href += '?avail=inStock';
}
