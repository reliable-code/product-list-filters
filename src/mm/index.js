import { initListClean } from './pages/productList';
import { initOffersClean } from './pages/productPage';

if (isProductPage()) {
    setInterval(initOffersClean, 100);
} else {
    setInterval(initListClean, 100);
}

function isProductPage() {
    return window.location.pathname.includes('details');
}
