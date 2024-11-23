import { waitForElement } from '../common/dom/utils';
import { initFavoritesMods } from './pages/favorites';
import { initProductListMods, paginatorContent } from './pages/productList';
import { initProductPageMods } from './pages/productPage';
import { somePathElementEquals } from '../common/url';
import { addGlobalStyle } from '../common/dom/manipulation';
import { getFirstElement } from '../common/dom/helpers';
import { runMigration as migrateDb } from './db/db';
import { initCartMods, initCheckoutMods } from './pages/checkoutPage';
import { hideUnwantedElements } from './pages/common/common';

const COMMENTS_SELECTOR = '#comments';

migrateDb();

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

const { body } = document;

if (isBodyInitialized()) {
    initMods();
} else {
    const observer = new MutationObserver(() => {
        if (isBodyInitialized()) {
            observer.disconnect();
            initMods();
        }
    });

    observer.observe(body, {
        attributes: true,
        attributeFilter: ['class'],
    });
}

function isBodyInitialized() {
    return body.classList.contains('vsc-initialized');
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

    if (paginatorContent) {
        initProductListMods();
        return;
    }

    if (somePathElementEquals('reviews')) {
        const comments = getFirstElement(COMMENTS_SELECTOR);
        if (comments) comments.scrollIntoView();
        return;
    }

    if (somePathElementEquals('product')) {
        initProductPageMods();
        return;
    }

    if (somePathElementEquals('favorites')) {
        await initFavoritesMods();
    }
}

async function replaceFavoritesLink() {
    const favoritesLink = await waitForElement(document, '[data-widget="favoriteCounter"]');
    if (favoritesLink) favoritesLink.href += '?avail=inStock';
}
