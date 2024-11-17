import { initProductListMods } from './pages/productList';
import { initProductPageMods } from './pages/productPage';
import { initFavoritesMods } from './pages/favorites';
import { pathnameIncludes, somePathElementEquals } from '../common/url';

if (somePathElementEquals('catalog') || somePathElementEquals('brands')) {
    if (pathnameIncludes('detail')) {
        initProductPageMods();
    } else {
        initProductListMods();
    }
} else if (somePathElementEquals('favorites')) {
    initFavoritesMods();
}
