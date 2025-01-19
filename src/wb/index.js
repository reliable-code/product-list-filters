import { initProductListMods } from './pages/productList';
import { initProductPageMods } from './pages/productPage';
import { initFavoritesMods } from './pages/favorites';
import { initReviewsMods } from './pages/reviews';
import { pathnameIncludes, somePathElementEquals } from '../common/url';
import { debounce } from '../common/dom/utils';
import { runMigration } from './db';

runMigration();

hideUnwantedElements();

(function observeHead() {
    const { head } = document;

    const headObserver = new MutationObserver(debounce(addInitModsToQueue, 750));
    headObserver.observe(head, {
        childList: true,
    });
}());

let initModsQueue = Promise.resolve();

async function addInitModsToQueue() {
    alert('addInitModsToQueue');
    initModsQueue = initModsQueue.then(initMods);
}

async function initMods() {
    try {
        const currentPageModsFunction = getPageModsFunction();
        if (!currentPageModsFunction) return;

        await currentPageModsFunction();
    } catch (error) {
        console.error('Error in initMods:', error);
    }
}

function getPageModsFunction() {
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
