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

    const balancedCashbackUsage = getBalancedCashbackUsage(priceNumber, cashbackNumber);

    const balancedCashbackPrice = priceNumber - balancedCashbackUsage;

    const newPriceElementText =
        `${priceNumber.toLocaleString()} (${balancedCashbackPrice.toLocaleString()}) ₽`;
    priceElement.innerText = newPriceElementText;
    priceElement.title = `-${balancedCashbackUsage.toLocaleString()}`;

    priceElement.setAttribute(PRICE_ATTR, priceNumber);
    priceElement.setAttribute(BALANCED_CASHBACK_PRICE_ATTR, balancedCashbackPrice);
}

function getPriceNumber(priceElement) {
    if (priceElement.hasAttribute(PRICE_ATTR)) {
        return +priceElement.getAttribute(PRICE_ATTR);
    }

    return getElementInnerNumber(priceElement, true);
}

function checkCouponValueChanged(priceElement, couponValue) {
    if (priceElement.hasAttribute(COUPON_ATTR)) {
        const oldCouponValue = +priceElement.getAttribute(COUPON_ATTR);
        return couponValue !== oldCouponValue;
    }

    return !!couponValue;
}

function getBalancedCashbackUsage(price, cashback) {
    const cashbackCoeff = cashback / 100;
    return ((price * cashbackCoeff) / (1 + cashbackCoeff)).toFixed(0);
}
