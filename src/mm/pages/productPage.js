import { debounce, waitForElement } from '../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../common/filter/manager';

import { StoredInputValue } from '../../common/storage/storage';
import {
    addBalancedCashbackPriceIfNeeded,
    BALANCED_CASHBACK_PRICE_ATTR,
    PRICE_ATTR,
} from './common/common';
import { getURLPathElementEnding } from '../../common/url';
import { InputValue } from '../../common/storage/models/inputValue';
import { isGreaterThanFilter, isLessThanFilter } from '../../common/filter/compare';
import { hideElement, showElement, updateElementDisplay } from '../../common/dom/manipulation';
import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    styleStringToObject,
} from '../../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMaxPriceFilterControl,
    createMinCashbackFilterControl,
    createMinRatingFilterControl,
    createPriceFilterControl,
} from '../../common/filter/factories/specificControls';
import { createFilterControlNumber } from '../../common/filter/factories/genericControls';

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
    executeProductPageMods();

    waitForElement(document, '#app')
        .then((app) => {
            const observer = new MutationObserver(debounce(executeProductPageMods));

            observer.observe(app, {
                childList: true,
            });
        });
}

function executeProductPageMods() {
    waitForElement(document, '.pdp-prices-filter')
        .then((offersFilter) => {
            appendFilterControlsIfNeeded(offersFilter, appendFiltersContainer);

            cleanOffers();

            const offersContainer = getFirstElement('.pdp-prices');

            if (offersContainer.hasAttribute('observed')) return;

            const observer = new MutationObserver(debounce(cleanOffers, 50));

            observer.observe(offersContainer, {
                childList: true,
                subtree: true,
            });

            offersContainer.setAttribute('observed', '');
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
            minCashbackFilter, styleStringToObject(controlStyle), styleStringToObject(numberInputStyle),
        );

    const maxPriceDiv =
        createMaxPriceFilterControl(
            maxPriceFilter, styleStringToObject(controlStyle), styleStringToObject(numberInputStyle),
        );

    const maxDiscountedPriceDiv =
        createPriceFilterControl(
            'Макс. цена со скидкой: ', maxDiscountedPriceFilter, styleStringToObject(controlStyle), styleStringToObject(numberInputStyle),
        );

    const minSellerRatingDiv =
        createMinRatingFilterControl(
            minSellerRatingFilter, styleStringToObject(controlStyle), styleStringToObject(numberInputStyle),
        );

    const couponValueDiv =
        createFilterControlNumber(
            'Купон: ',
            couponValue,
            '500',
            '0',
            '100000',
            styleStringToObject(controlStyle),
            styleStringToObject(numberInputStyle),
        );

    const filterEnabledDiv =
        createEnabledFilterControl(
            filterEnabled, styleStringToObject(controlStyle), styleStringToObject(checkboxInputStyle),
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

            const sellerRatingWrap =
                getFirstElement('.pdp-merchant-rating-block__rating', offer);

            if (!priceWrap || !cashbackWrap || !sellerRatingWrap) {
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

            const sellerRatingNumber = getElementInnerNumber(sellerRatingWrap, true);

            const shouldHide =
                isLessThanFilter(cashbackNumber, minCashbackFilter) ||
                isGreaterThanFilter(price, maxPriceFilter) ||
                isGreaterThanFilter(balancedCashbackPrice, maxDiscountedPriceFilter) ||
                isLessThanFilter(sellerRatingNumber, minSellerRatingFilter);
            updateElementDisplay(offer, shouldHide);
        },
    );
}
