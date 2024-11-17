import { initProductListMods } from './pages/productList';
import { initProductPageMods } from './pages/productPage';
import { initFavoritesMods } from './pages/favorites';
import { pathnameIncludes, somePathElementEquals } from '../common/url';
import { debounce } from '../common/dom/utils';

const headObserver = new MutationObserver(debounce(initMods));

const { head } = document;

if (head) {
    headObserver.observe(head, {
        childList: true,
    });
}

function initMods() {
    if (somePathElementEquals('catalog') || somePathElementEquals('brands')) {
        if (pathnameIncludes('detail')) {
            initProductPageMods();
        } else {
            initProductListMods();
        }
    } else if (somePathElementEquals('favorites')) {
        initFavoritesMods();
    }
}
