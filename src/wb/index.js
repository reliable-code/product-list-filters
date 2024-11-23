import { initProductListMods } from './pages/productList';
import { initProductPageMods } from './pages/productPage';
import { initFavoritesMods } from './pages/favorites';
import { pathnameIncludes, somePathElementEquals } from '../common/url';
import { debounce } from '../common/dom/utils';
import { runMigration } from './db/db';

runMigration();

(function observeHead() {
    const { head } = document;

    const headObserver = new MutationObserver(debounce(initMods, 750));
    headObserver.observe(head, {
        childList: true,
    });
}());

async function initMods() {
    if (somePathElementEquals('catalog') || somePathElementEquals('brands')) {
        if (pathnameIncludes('detail')) {
            await initProductPageMods();
        } else {
            initProductListMods();
        }
    } else if (somePathElementEquals('favorites')) {
        initFavoritesMods();
    }
}
