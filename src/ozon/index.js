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
            if (isAutoSkipCart()) {
                autoSkipCartOrReload();
            } else if (isAutoCheckout()) {
                checkCheckoutGoodPrice();
            }
        } else {
            initMods();
        }
    });

function isAutoCheckout() {
    return isBoolStorageOption('autoCheckout');
}

function isAutoSkipCart() {
    return isBoolStorageOption('autoSkipCart');
}

function isAutoReloadCheckout() {
    return isBoolStorageOption('autoReloadCheckout');
}

function isAutoCheckoutProd() {
    return isBoolStorageOption('autoCheckoutProd');
}

function isBoolStorageOption(key) {
    const boolStorageOption = getBoolStorageOption(key);

    return boolStorageOption === '1';
}

function getBoolStorageOption(key) {
    let boolStorageOption = localStorage.getItem(key);

    if (boolStorageOption === null) {
        boolStorageOption = '0';
        localStorage.setItem(key, boolStorageOption);
    }

    return boolStorageOption;
}

function autoSkipCartOrReload() {
    const totalWidgetDesktop = getTotalWidgetDesktop();
    const checkoutButton = getCheckoutButton(totalWidgetDesktop);

    if (checkoutButton.hasAttribute('disabled')) {
        setTimeout(() => window.location.reload(), 1500);
    } else {
        checkoutButton.click();
    }
}

function checkCheckoutGoodPrice() {
    const storedCheckoutGoodPrice = localStorage.getItem('autoCheckoutGoodPrice');

    if (storedCheckoutGoodPrice !== null) {
        console.log('autoCheckoutGoodPrice: ', storedCheckoutGoodPrice);
        return;
    }

    if (confirm('Установить цену для автопокупки?')) {
        const autoCheckoutGoodPrice = prompt('Введите допустимую цену:');
        localStorage.setItem('autoCheckoutGoodPrice', autoCheckoutGoodPrice);
    }
}

function autoBuyIfGoodPrice() {
    const totalWidgetDesktop = getTotalWidgetDesktop();
    const checkoutButton = getCheckoutButton(totalWidgetDesktop);

    const priceContainer = totalWidgetDesktop.children[1].lastElementChild.children[1];
    const price = getElementInnerNumber(priceContainer, true);
    const autoCheckoutGoodPrice = localStorage.getItem('autoCheckoutGoodPrice');

    if (autoCheckoutGoodPrice === null) {
        console.log('No autoCheckoutGoodPrice in localStorage');
        return;
    }

    const autoCheckoutGoodPriceNumber = +autoCheckoutGoodPrice;

    if (price <= autoCheckoutGoodPriceNumber) {
        if (isAutoCheckoutProd()) {
            checkoutButton.click();
            console.log('Реальная покупка');
        } else {
            console.log('Тестовая покупка');
        }

        console.log('autoCheckoutGoodPrice: ', autoCheckoutGoodPriceNumber);
        console.log('price: ', price);
    } else {
        console.log('autoCheckoutGoodPrice: ', autoCheckoutGoodPriceNumber);
        console.log('price: ', price);
        console.log('Дорого!');
        if (isAutoReloadCheckout()) {
            setTimeout(() => window.location.reload(), 1500);
        }
    }
}

function getTotalWidgetDesktop() {
    const totalWidget = getFirstElement('[data-widget="total"]');

    return totalWidget.children[0];
}

function getCheckoutButton(totalWidgetDesktop) {
    return getFirstElement('button', totalWidgetDesktop);
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
