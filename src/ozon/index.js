import { waitForElement } from '../common/dom/utils';
import { initFavoritesMods } from './pages/favorites';
import { initProductListMods, paginatorContent } from './pages/productList';
import { initProductPageMods } from './pages/productPage';
import { somePathElementEquals } from '../common/url';
import { addGlobalStyle } from '../common/dom/manipulation';
import { getFirstElement } from '../common/dom/helpers';
import { runMigration as migrateDb } from './db/db';
import {
    autoBuyIfGoodPrice,
    autoSkipCartOrReload,
    checkCheckoutGoodPrice,
    isAutoCheckout,
    isAutoSkipCart,
} from './pages/checkoutPage';

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

function initMods() {
    if (somePathElementEquals('gocheckout')) {
        if (isAutoCheckout()) autoBuyIfGoodPrice();
        return;
    }

    if (somePathElementEquals('cart')) {
        if (isAutoSkipCart()) {
            autoSkipCartOrReload();
        } else if (isAutoCheckout()) {
            checkCheckoutGoodPrice();
        }
        return;
    }

    replaceFavoritesLink();

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
        initFavoritesMods();
    }
}

async function replaceFavoritesLink() {
    const favoritesLink = await waitForElement(document, '[data-widget="favoriteCounter"]');
    if (favoritesLink) favoritesLink.href += '?avail=inStock';
}
