import { getElementInnerNumber, getFirstElement } from '../../../common/dom/helpers';

export const ATTRIBUTES = {
    PRICE: 'price',
    BALANCED_CASHBACK_PRICE: 'balanced-cashback-price',
    COUPON: 'applied-coupon',
};

export function addBalancedCashbackPriceIfNeeded(
    priceParent, priceSelector, cashbackNumber, couponValue,
) {
    const priceElement = getFirstElement(priceSelector, priceParent);
    const couponValueChanged = checkCouponValueChanged(priceElement, couponValue);

    if (couponValueChanged || !priceElement.hasAttribute(ATTRIBUTES.BALANCED_CASHBACK_PRICE)) {
        addBalancedCashbackPrice(priceElement, cashbackNumber, couponValue);
    }

    return priceElement;
}

function checkCouponValueChanged(priceElement, couponValue) {
    if (priceElement.hasAttribute(ATTRIBUTES.COUPON)) {
        const oldCouponValue = +priceElement.getAttribute(ATTRIBUTES.COUPON);
        return couponValue !== oldCouponValue;
    }

    return !!couponValue;
}

function addBalancedCashbackPrice(priceElement, cashbackNumber, couponValue) {
    let priceNumber = getPriceNumber(priceElement);
    priceElement.setAttribute(ATTRIBUTES.PRICE, priceNumber);

    if (couponValue) {
        if (couponValue < 1) {
            priceNumber = (priceNumber * (1 - couponValue)).toFixed();
        } else {
            priceNumber -= couponValue;
        }
        priceElement.setAttribute(ATTRIBUTES.COUPON, couponValue);
    } else {
        priceElement.removeAttribute(ATTRIBUTES.COUPON);
    }

    const balancedCashbackUsage = getBalancedCashbackUsage(priceNumber, cashbackNumber);

    const balancedCashbackPrice = priceNumber - balancedCashbackUsage;
    priceElement.setAttribute(ATTRIBUTES.BALANCED_CASHBACK_PRICE, balancedCashbackPrice);

    const newPriceElementText =
        `${priceNumber.toLocaleString()} (${balancedCashbackPrice.toLocaleString()}) ₽`;
    priceElement.innerText = newPriceElementText;
    priceElement.title = `-${balancedCashbackUsage.toLocaleString()}`;
}

function getPriceNumber(priceElement) {
    if (priceElement.hasAttribute(ATTRIBUTES.PRICE)) {
        return +priceElement.getAttribute(ATTRIBUTES.PRICE);
    }

    return getElementInnerNumber(priceElement, true);
}

function getBalancedCashbackUsage(price, cashback) {
    const cashbackCoeff = cashback / 100;
    return ((price * cashbackCoeff) / (1 + cashbackCoeff)).toFixed(0);
}
