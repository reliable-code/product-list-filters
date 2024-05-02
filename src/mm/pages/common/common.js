import { getElementInnerNumber, getFirstElement } from '../../../common/dom';

export const PRICE_ATTR = 'price';
export const BALANCED_CASHBACK_PRICE_ATTR = 'balanced-cashback-price';
export const COUPON_ATTR = 'applied-coupon';

export function addBalancedCashbackPriceIfNeeded(
    priceParent, priceSelector, cashbackNumber, couponValue,
) {
    const priceElement = getFirstElement(priceSelector, priceParent);
    const couponValueChanged = checkCouponValueChanged(priceElement, couponValue);

    if (couponValueChanged || !priceElement.hasAttribute(BALANCED_CASHBACK_PRICE_ATTR)) {
        addBalancedCashbackPrice(priceElement, cashbackNumber, couponValue);
    }

    return priceElement;
}

function addBalancedCashbackPrice(priceElement, cashbackNumber, couponValue) {
    let priceNumber = getPriceNumber(priceElement);
    priceElement.setAttribute(PRICE_ATTR, priceNumber);

    if (couponValue) {
        priceNumber -= couponValue;
        priceElement.setAttribute(COUPON_ATTR, couponValue);
    } else {
        priceElement.removeAttribute(COUPON_ATTR);
    }

    const balancedCashbackUsage = getBalancedCashbackUsage(priceNumber, cashbackNumber);

    const balancedCashbackPrice = priceNumber - balancedCashbackUsage;
    priceElement.setAttribute(BALANCED_CASHBACK_PRICE_ATTR, balancedCashbackPrice);

    const newPriceElementText =
        `${priceNumber.toLocaleString()} (${balancedCashbackPrice.toLocaleString()}) ₽`;
    priceElement.innerText = newPriceElementText;
    priceElement.title = `-${balancedCashbackUsage.toLocaleString()}`;
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
