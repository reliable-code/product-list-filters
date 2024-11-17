import { initProductPageMods } from './pages/productPage';
import { initProductListMods } from './pages/productList';
import { pathnameIncludes } from '../common/url';

if (isProductPage()) {
    initProductPageMods();
} else {
    initProductListMods();
}

function isProductPage() {
    return pathnameIncludes('details');
}
