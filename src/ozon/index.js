import {
    addGlobalStyle,
    getElementInnerNumber,
    getFirstElement,
    somePathElementEquals,
    waitForElement,
} from '../common/dom';
import { getStorageValue, setStorageValue } from '../common/storage';
import { initFavoritesMods } from './pages/favorites';
import { initProductListMods, paginatorContent } from './pages/productList';
import { initProductPageMods } from './pages/productPage';

const COMMENTS_SELECTOR = '#comments';

migrateDatabase();

function migrateDatabase() {
    const actualDBVersion = 3;

    const dbVersion = getStorageValue('dbVersion');
    if (dbVersion === actualDBVersion) return;

    const filterCondition = (key) => key.endsWith('-lp');

    const priceKeys = window.GM_listValues()
        .filter(filterCondition);
    priceKeys.forEach((key) => {
        const object = getStorageValue(key);
        const { value } = object;
        if (value === 0) {
            console.log(key);
            console.log(value);
            window.GM_deleteValue(key);
        }
    });

    setStorageValue('dbVersion', actualDBVersion);
}

hideUnwantedElements();

function hideUnwantedElements() {
    const css =
        '[data-widget="bigPromoPDP"],' +
        '[data-widget="blackFridayStatus"],' +
        '[data-widget="cellList"],' +
        '[data-widget="skuGrid"],' +
        '[data-widget="skuShelfGoods"],' +
        '[data-widget="tagList"],' +
        '[data-widget="webInstallmentPurchase"],' +
        '[data-widget="webOneClickButton"] {' +
        '   display: none !important;' +
        '}';

    addGlobalStyle(css);
}

waitForElement(document, '.vsc-initialized')
    .then((initializedBody) => {
        if (!initializedBody) return;

        if (somePathElementEquals('gocheckout')) {
            if (isAutoCheckout()) autoBuyIfGoodPrice();
        } else if (somePathElementEquals('cart')) {
            if (isAutoCheckout()) checkGoodCheckoutPrice();
        } else {
            initMods();
        }
    });

function isAutoCheckout() {
    const autoCheckout = getAutoCheckout();

    return autoCheckout === '1';
}

function getAutoCheckout() {
    let autoCheckout = localStorage.getItem('autoCheckout');

    if (autoCheckout === null) {
        autoCheckout = '0';
        localStorage.setItem('autoCheckout', autoCheckout);
    }

    return autoCheckout;
}

function checkGoodCheckoutPrice() {
    const storedGoodCheckoutPrice = localStorage.getItem('goodCheckoutPrice');

    if (storedGoodCheckoutPrice !== null) {
        console.log('goodCheckoutPrice: ', storedGoodCheckoutPrice);
        return;
    }

    if (confirm('Установить цену для автопокупки?')) {
        const goodCheckoutPrice = prompt('Введите допустимую цену:');
        localStorage.setItem('goodCheckoutPrice', goodCheckoutPrice);
    }
}

function autoBuyIfGoodPrice() {
    const stickyContainer =
        getFirstElement('[data-widget="stickyContainer"]');
    const totalBlock =
        getFirstElement('[data-widget="total"]', stickyContainer);

    const totalChildren0 = totalBlock.children[0];

    const payButton = getFirstElement('button', totalChildren0);

    const totalChildren0141 = totalChildren0.children[1].children[4].children[1];
    const price = getElementInnerNumber(totalChildren0141, true);
    const goodCheckoutPrice = localStorage.getItem('goodCheckoutPrice');

    if (goodCheckoutPrice === null) {
        console.log('No goodCheckoutPrice in localStorage');
        return;
    }

    const goodCheckoutPriceNumber = +goodCheckoutPrice;

    if (price < goodCheckoutPriceNumber) {
        payButton.click();
        console.log('goodCheckoutPrice: ', goodCheckoutPriceNumber);
        console.log('price: ', price);
        console.log('Покупаем!');
    } else {
        console.log('goodCheckoutPrice: ', goodCheckoutPriceNumber);
        console.log('price: ', price);
        console.log('Дорого!');
    }
}

function initMods() {
    replaceFavoritesLink();

    if (paginatorContent) {
        initProductListMods();
    } else if (somePathElementEquals('reviews')) {
        const comments = getFirstElement(COMMENTS_SELECTOR);
        if (comments) comments.scrollIntoView();
    } else if (somePathElementEquals('product')) {
        initProductPageMods();
    } else if (somePathElementEquals('favorites')) {
        initFavoritesMods();
    }
}

function replaceFavoritesLink() {
    waitForElement(document, '[data-widget="favoriteCounter"]')
        .then((favoritesLink) => {
            favoritesLink.href += '?avail=inStock';
            // favoritesLink.addEventListener('click', (e) => {
            //     alert(e.button);
            //     alert('https://www.ozon.ru/my/favorites?avail=inStock');
            // });
        });
}
