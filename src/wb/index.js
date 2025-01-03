import { initProductListMods } from './pages/productList';
import { initProductPageMods } from './pages/productPage';
import { initFavoritesMods } from './pages/favorites';
import { pathnameIncludes, somePathElementEquals } from '../common/url';
import { debounce } from '../common/dom/utils';
import { runMigration } from './db/db';
import { initReviewsMods } from './pages/reviews';

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
    initModsQueue = initModsQueue.then(initMods);
}

async function initMods() {
    try {
        if (somePathElementEquals('catalog') || somePathElementEquals('brands')) {
            if (pathnameIncludes('detail')) {
                await initProductPageMods();
            } else if (somePathElementEquals('feedbacks')) {
                await initReviewsMods();
            } else {
                await initProductListMods();
            }
        } else if (somePathElementEquals('favorites')) {
            await initFavoritesMods();
        }
    } catch (error) {
        console.error('Error in initMods:', error);
    }
}

export function hideUnwantedElements() {
    window.GM_addStyle(`
        .j-b-recommended-goods-wrapper {
            display: none !important;
        }
    `);
}
