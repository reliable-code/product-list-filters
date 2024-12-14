import { getElementInnerNumber, getFirstElement } from '../../../common/dom/helpers';
import { STORAGE_KEYS } from './storageKeys';

export function initCheckoutMods() {
    if (isAutoCheckout()) {
        autoBuyIfGoodPrice();
    }
}

export function initCartMods() {
    if (isAutoSkipCart()) {
        autoSkipCartOrReload();
        return;
    }

    if (isAutoCheckout()) {
        checkCheckoutGoodPrice();
    }
}

function getBoolStorageOption(key, defaultValue = '0') {
    const value = localStorage.getItem(key);
    if (value !== null) return value;

    localStorage.setItem(key, defaultValue);
    return defaultValue;
}

function isBoolStorageOption(key) {
    return getBoolStorageOption(key) === '1';
}

function isAutoCheckout() {
    return isBoolStorageOption(STORAGE_KEYS.AUTO_CHECKOUT);
}

function isAutoSkipCart() {
    return isBoolStorageOption(STORAGE_KEYS.AUTO_SKIP_CART);
}

function isAutoReloadCheckout() {
    return isBoolStorageOption(STORAGE_KEYS.AUTO_RELOAD_CHECKOUT);
}

function isAutoCheckoutProd() {
    return isBoolStorageOption(STORAGE_KEYS.AUTO_CHECKOUT_PROD);
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
    const storedPrice = localStorage.getItem(STORAGE_KEYS.AUTO_CHECKOUT_GOOD_PRICE);

    if (storedPrice !== null) {
        console.log('autoCheckoutGoodPrice: ', storedPrice);
        return;
    }

    if (confirm('Установить цену для автопокупки?')) {
        const autoCheckoutGoodPrice = prompt('Введите допустимую цену:');
        localStorage.setItem(STORAGE_KEYS.AUTO_CHECKOUT_GOOD_PRICE, autoCheckoutGoodPrice);
    }
}

function autoBuyIfGoodPrice() {
    const totalWidgetDesktop = getTotalWidgetDesktop();
    const checkoutButton = getCheckoutButton(totalWidgetDesktop);

    if (checkoutButton.hasAttribute('disabled') && isAutoReloadCheckout()) {
        setTimeout(() => window.location.reload(), 1500);
        return;
    }

    const priceContainer = totalWidgetDesktop.children[1].lastElementChild.children[1];
    const price = getElementInnerNumber(priceContainer, true);
    const autoCheckoutGoodPrice = localStorage.getItem(STORAGE_KEYS.AUTO_CHECKOUT_GOOD_PRICE);

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
