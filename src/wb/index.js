import { pathnameIncludes, somePathElementEquals } from '../common/dom';
import { initProductListMods } from './pages/productList';

if (somePathElementEquals('catalog')) {
    if (pathnameIncludes('detail')) {
        console.log('product page');
    } else {
        initProductListMods();
    }
}
