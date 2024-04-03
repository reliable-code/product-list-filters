import { initProductPageMods } from './pages/productPage';
import { initProductListMods } from './pages/productList';

if (isProductPage()) {
    initProductPageMods();
} else {
    initProductListMods();
}

function isProductPage() {
    return window.location.pathname.includes('details');
}
