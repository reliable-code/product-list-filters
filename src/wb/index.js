import { initProductListMods } from './pages/productList';
import { initProductPageMods } from './pages/productPage';
import { pathnameIncludes, somePathElementEquals } from '../common/url';

if (somePathElementEquals('catalog')) {
    if (pathnameIncludes('detail')) {
        initProductPageMods();
    } else {
        initProductListMods();
    }
}
