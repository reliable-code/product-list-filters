import { getElementInnerNumber, getFirstElement } from '../../../common/dom';

export const PRICE_ATTR = 'price';
export const BALANCED_CASHBACK_PRICE_ATTR = 'balanced-cashback-price';

export function addBalancedCashbackPriceIfNeeded(priceParent, priceSelector, cashbackNumber) {
    const priceElement = getFirstElement(priceSelector, priceParent);

    if (!priceElement.hasAttribute(BALANCED_CASHBACK_PRICE_ATTR)) {
        addBalancedCashbackPrice(priceElement, cashbackNumber);
    }

    return priceElement;
}

function addBalancedCashbackPrice(priceElement, cashbackNumber) {
    const priceNumber =
        getElementInnerNumber(priceElement, true);

    const balancedCashbackPrice =
        getBalancedCashbackPrice(priceNumber, cashbackNumber);

    const newPriceElementText =
        `${priceNumber.toLocaleString()} (${balancedCashbackPrice.toLocaleString()}) ₽`;
    priceElement.innerText = newPriceElementText;

    priceElement.setAttribute(PRICE_ATTR, priceNumber);
    priceElement.setAttribute(BALANCED_CASHBACK_PRICE_ATTR, balancedCashbackPrice);
}

function getBalancedCashbackPrice(price, cashback) {
    const balancedCashbackUsage = getBalancedCashbackUsage(price, cashback);
    return price - balancedCashbackUsage;
}

function getBalancedCashbackUsage(price, cashback) {
    const cashbackCoeff = cashback / 100;
    return ((price * cashbackCoeff) / (1 + cashbackCoeff)).toFixed(0);
}
