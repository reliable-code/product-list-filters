import { runMigration as migrateDb } from './db';
import { addCustomStyles, hideUnwantedElements } from './pages/common';
import { waitForElement } from '../common/dom/utils';
import { initFavoritesMods } from './pages/favorites';
import { initProductListMods } from './pages/productList';
import { initProductPageMods } from './pages/productPage';
import { initReviewsMods } from './pages/reviews';
import { initCartMods, initCheckoutMods } from './pages/checkoutPage';
import { somePathElementEquals } from '../common/url';
import { getFirstElement } from '../common/dom/helpers';
import { SELECTORS } from './selectors';
import { wrapFirstElementWithLink } from '../common/dom/manipulation';

migrateDb();

hideUnwantedElements();
addCustomStyles();

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
        fixLinks();
        return;
    }

    if (somePathElementEquals('cart')) {
        initCartMods();
        fixLinks();
        return;
    }

    fixLinks();

    const paginator = getFirstElement(SELECTORS.PAGINATOR);
    if (paginator) {
        await initProductListMods(paginator);
        return;
    }

    if (somePathElementEquals('reviews')) {
        await initReviewsMods();
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

function fixLinks() {
    const header = getFirstElement(SELECTORS.HEADER);
    if (header.querySelectorAll('a').length >= 5) {
        setTimeout(replaceFavoritesLink, 0);
        return;
    }

    wrapFirstElementWithLink('/my/main', SELECTORS.PROFILE_LOGO);
    wrapFirstElementWithLink('/my/orderlist', SELECTORS.ORDER_INFO);
    wrapFirstElementWithLink('/my/favorites?avail=inStock', SELECTORS.FAVORITES);
    wrapFirstElementWithLink('/cart', SELECTORS.HEADER_ICON);
}

async function replaceFavoritesLink() {
    const favoritesLink = await waitForElement(document, SELECTORS.FAVORITES, 3000);
    if (!favoritesLink) return;
    favoritesLink.href = `${favoritesLink.getAttribute('href')}?avail=inStock`;
}
