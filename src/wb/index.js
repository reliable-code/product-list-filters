import { pathnameIncludes, somePathElementEquals } from '../common/dom';
import { initProductListMods } from './pages/productList';
import { initProductPageMods } from './pages/productPage';

if (somePathElementEquals('catalog')) {
    if (pathnameIncludes('detail')) {
        initProductPageMods();
    } else {
        initProductListMods();
    }
}
