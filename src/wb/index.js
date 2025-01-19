import { initProductListMods } from './pages/productList';
import { initProductPageMods } from './pages/productPage';
import { initFavoritesMods } from './pages/favorites';
import { initReviewsMods } from './pages/reviews';
import {
    getURLQueryParam,
    interceptHistoryMethod,
    pathnameIncludes,
    somePathElementEquals,
} from '../common/url';
import { runMigration } from './db';

runMigration();

hideUnwantedElements();

await initMods();

(function initURLObserver() {
    const lastPathname = window.location.pathname;
    const lastSearchParam = getURLQueryParam('search');

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = interceptHistoryMethod(originalPushState, handleURLChange);
    window.history.replaceState = interceptHistoryMethod(originalReplaceState, handleURLChange);

    window.addEventListener('popstate', handleURLChange);

    function handleURLChange() {
        const currentPathname = window.location.pathname;
        const currentSearchParam = getURLQueryParam('search');

        if (lastPathname !== currentPathname || lastSearchParam !== currentSearchParam) {
            window.location.reload();
        }
    }
}());

async function initMods() {
    try {
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
