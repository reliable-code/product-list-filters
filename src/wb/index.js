import { initProductListMods } from './pages/productList';
import { initProductPageMods } from './pages/productPage';
import { initFavoritesMods } from './pages/favorites';
import { initReviewsMods } from './pages/reviews';
import { getURLQueryParam, pathnameIncludes, somePathElementEquals } from '../common/url';
import { runMigration } from './db';
import { debounce } from '../common/dom/utils';

runMigration();

hideUnwantedElements();

(function observeHead() {
    const { head } = document;

    const headObserver = new MutationObserver(debounce(initMods, 750));
    headObserver.observe(head, {
        childList: true,
    });
}());

let lastPathname = null;
let lastQueryParam = null;

await initMods();

async function initMods() {
    try {
        const currentPathname = window.location.pathname;
        const currentQueryParam = getURLQueryParam('search');

        if (
            (lastPathname !== null && lastPathname !== currentPathname) ||
            (lastQueryParam !== null && lastQueryParam !== currentQueryParam)
        ) {
            window.location.reload();
            return;
        }

        lastPathname = currentPathname;
        lastQueryParam = currentQueryParam;

        const pageModsFunc = getPageModsFunc();
        if (!pageModsFunc) return;

        await pageModsFunc();
    } catch (error) {
        console.error('Error in initMods:', error);
    }
}

function getPageModsFunc() {
    if (somePathElementEquals('catalog') || somePathElementEquals('brands')) {
        if (pathnameIncludes('detail')) {
            return initProductPageMods;
        }

        if (somePathElementEquals('feedbacks')) {
            return initReviewsMods;
        }

        return initProductListMods;
    }

    if (somePathElementEquals('favorites')) {
        return initFavoritesMods;
    }

    return null;
}

export function hideUnwantedElements() {
    window.GM_addStyle(`
        .j-b-recommended-goods-wrapper {
            display: none !important;
        }
    `);
}
