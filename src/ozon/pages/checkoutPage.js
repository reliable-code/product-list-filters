import { getElementInnerNumber, getFirstElement } from '../../common/dom/helpers';

export function isAutoCheckout() {
    return isBoolStorageOption('autoCheckout');
}

export function isAutoSkipCart() {
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

export function autoSkipCartOrReload() {
    const totalWidgetDesktop = getTotalWidgetDesktop();
    const checkoutButton = getCheckoutButton(totalWidgetDesktop);

    if (checkoutButton.hasAttribute('disabled')) {
        setTimeout(() => window.location.reload(), 1500);
    } else {
        checkoutButton.click();
    }
}

export function checkCheckoutGoodPrice() {
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

export function autoBuyIfGoodPrice() {
    const totalWidgetDesktop = getTotalWidgetDesktop();
    const checkoutButton = getCheckoutButton(totalWidgetDesktop);

    if (checkoutButton.hasAttribute('disabled')) {
        if (isAutoReloadCheckout()) {
            setTimeout(() => window.location.reload(), 1500);
            return;
        }
    }

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
