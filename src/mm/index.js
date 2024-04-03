import { initListClean } from './pages/productList';
import { initProductPageMods } from './pages/productPage';

if (isProductPage()) {
    initProductPageMods();
} else {
    setInterval(initListClean, 100);
}

function isProductPage() {
    return window.location.pathname.includes('details');
}
