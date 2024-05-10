import {
    debounce,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    getURLPathElementEnding,
    hideElement,
    InputValue,
    showElement,
    showHideElement,
    waitForElement,
} from '../../common/dom';
import {
    appendFilterControlsIfNeeded,
    createCouponValueControl,
    createEnabledFilterControl,
    createMaxDiscountedPriceFilterControl,
    createMaxPriceFilterControl,
    createMinCashbackFilterControl,
    createMinRatingFilterControl,
    isGreaterThanFilter,
    isLessThanFilter,
} from '../../common/filter';

import { StoredInputValue } from '../../common/storage';
import {
    addBalancedCashbackPriceIfNeeded,
    BALANCED_CASHBACK_PRICE_ATTR,
    PRICE_ATTR,
} from './common/common';

const PRODUCT_NAME = getURLPathElementEnding(3);

const minCashbackFilter =
    new StoredInputValue(`${PRODUCT_NAME}-min-cashback-filter`, null, cleanOffers);
const maxPriceFilter =
    new StoredInputValue(`${PRODUCT_NAME}-max-price-filter`, null, cleanOffers);
const maxDiscountedPriceFilter =
    new StoredInputValue(`${PRODUCT_NAME}-max-discounted-price-filter`, null, cleanOffers);
const minSellerRatingFilter =
    new StoredInputValue('min-seller-rating-filter', null, cleanOffers);
const couponValue =
    new InputValue(null, cleanOffers);
const filterEnabled =
    new StoredInputValue('filter-enabled', false, cleanOffers);

export function initProductPageMods() {
    waitForElement(document, '.pdp-prices-filter')
        .then((offersFilter) => {
            appendFilterControlsIfNeeded(offersFilter, appendFiltersContainer);

            const observer = new MutationObserver(debounce(cleanOffers, 50));

            const offersContainer = getFirstElement('.pdp-prices');

            observer.observe(offersContainer, {
                childList: true,
                subtree: true,
            });
        });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    filtersContainer.style =
        'display: flex;' +
        'grid-gap: 15px;' +
        'padding: 14px 5px;';

    const controlStyle =
        'display: flex;' +
        'align-items: center;' +
        'font-size: 14px;';
    const inputStyle =
        'border: 1px solid #e4ebf0;' +
        'font-size: 14px;' +
        'border-radius: 8px;' +
        'margin-left: 7px;' +
        'padding: 8px 14px;';
    const numberInputStyle =
        inputStyle; // eslint-disable-line prefer-template
    const checkboxInputStyle =
        'margin-left: 7px;' +
        'width: 23px;' +
        'height: 23px;';

    const minCashbackDiv =
        createMinCashbackFilterControl(
            minCashbackFilter, controlStyle, numberInputStyle,
        );

    const maxPriceDiv =
        createMaxPriceFilterControl(
            maxPriceFilter, controlStyle, numberInputStyle,
        );

    const maxDiscountedPriceDiv =
        createMaxDiscountedPriceFilterControl(
            maxDiscountedPriceFilter, controlStyle, numberInputStyle,
        );

    const minSellerRatingDiv =
        createMinRatingFilterControl(
            minSellerRatingFilter, controlStyle, numberInputStyle,
        );

    const couponValueDiv =
        createCouponValueControl(
            couponValue, controlStyle, numberInputStyle,
        );

    const filterEnabledDiv =
        createEnabledFilterControl(
            filterEnabled, controlStyle, checkboxInputStyle,
        );

    filtersContainer.append(
        minCashbackDiv,
        maxPriceDiv,
        maxDiscountedPriceDiv,
        minSellerRatingDiv,
        couponValueDiv,
        filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
}

function cleanOffers() {
    const offers = getAllElements('.pdp-prices .product-offer');

    offers.forEach(
        (offer) => {
            if (!filterEnabled.value) {
                showElement(offer);

                return;
            }

            const priceWrap =
                getFirstElement('.product-offer-price__amount', offer);

            const cashbackWrap =
                getFirstElement('.bonus-percent', offer);

            if (!priceWrap || !cashbackWrap) {
                hideElement(offer);

                return;
            }

            const cashbackNumber = getElementInnerNumber(cashbackWrap, true);

            const priceElement =
                addBalancedCashbackPriceIfNeeded(
                    offer, '.product-offer-price__amount', cashbackNumber, couponValue.value,
                );

            const price =
                +priceElement.getAttribute(PRICE_ATTR);

            const balancedCashbackPrice =
                +priceElement.getAttribute(BALANCED_CASHBACK_PRICE_ATTR);

            const sellerRatingWrap =
                getFirstElement('.pdp-merchant-rating-block__rating', offer);

            const sellerRatingNumber = getElementInnerNumber(sellerRatingWrap, true);

            const conditionToHide =
                isLessThanFilter(cashbackNumber, minCashbackFilter) ||
                isGreaterThanFilter(price, maxPriceFilter) ||
                isGreaterThanFilter(balancedCashbackPrice, maxDiscountedPriceFilter) ||
                isLessThanFilter(sellerRatingNumber, minSellerRatingFilter);
            showHideElement(offer, conditionToHide);
        },
    );
}
