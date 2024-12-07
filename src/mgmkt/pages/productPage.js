import { debounce, waitForElement } from '../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../common/filter/manager';

import { StoredInputValue } from '../../common/storage/storage';
import { addBalancedCashbackPriceIfNeeded } from './common/common';
import { getURLPathElementEnding } from '../../common/url';
import { InputValue } from '../../common/storage/models/inputValue';
import { isGreaterThanFilter, isLessThanFilter } from '../../common/filter/compare';
import { hideElement, showElement, updateElementDisplay } from '../../common/dom/manipulation';
import {
    applyStyles,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMaxPriceFilterControl,
    createMinCashbackFilterControl,
    createMinRatingFilterControl,
    createPriceFilterControl,
} from '../../common/filter/factories/specificControls';
import { createNumberFilterControl } from '../../common/filter/factories/genericControls';
import { ATTRIBUTES } from './common/attributes';
import { STYLES } from './common/styles';
import { fnv1aHash32 as getHash } from '../../common/crypto';

const PRODUCT_NAME_HASH = getHash(getURLPathElementEnding(3));

const minCashbackFilter =
    new StoredInputValue(`${PRODUCT_NAME_HASH}-min-cashback-filter`, null, processOffers);
const maxPriceFilter =
    new StoredInputValue(`${PRODUCT_NAME_HASH}-max-price-filter`, null, processOffers);
const maxDiscountedPriceFilter =
    new StoredInputValue(`${PRODUCT_NAME_HASH}-max-discounted-price-filter`, null, processOffers);
const minSellerRatingFilter =
    new StoredInputValue('min-seller-rating-filter', null, processOffers);
const couponValue =
    new InputValue(null, processOffers);
const filterEnabled =
    new StoredInputValue('filter-enabled', false, processOffers);

export async function initProductPageMods() {
    await executeProductPageMods();

    const app = await waitForElement(document, '#app');
    const observer = new MutationObserver(debounce(executeProductPageMods));

    observer.observe(app, {
        childList: true,
    });
}

async function executeProductPageMods() {
    const offersFilter = await waitForElement(document, '.pdp-prices-filter');

    appendFilterControlsIfNeeded(offersFilter, appendFiltersContainer);

    processOffers();

    const offersContainer = getFirstElement('.pdp-prices');

    if (offersContainer.hasAttribute(ATTRIBUTES.OBSERVED)) return;

    const observer = new MutationObserver(debounce(processOffers, 50));

    observer.observe(offersContainer, {
        childList: true,
        subtree: true,
    });

    offersContainer.setAttribute(ATTRIBUTES.OBSERVED, '');
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.CONTAINER);

    const minCashbackDiv = createMinCashbackFilterControl(
        minCashbackFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );

    const maxPriceDiv = createMaxPriceFilterControl(
        maxPriceFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );

    const maxDiscountedPriceDiv = createPriceFilterControl(
        'Макс. цена со скидкой: ',
        maxDiscountedPriceFilter,
        STYLES.CONTROL,
        STYLES.NUMBER_INPUT,
    );

    const minSellerRatingDiv = createMinRatingFilterControl(
        minSellerRatingFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );

    const couponValueDiv = createNumberFilterControl(
        'Купон: ',
        couponValue,
        '500',
        '0',
        '100000',
        STYLES.CONTROL,
        STYLES.NUMBER_INPUT,
    );

    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
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

function processOffers() {
    const offers = getAllElements('.pdp-prices .product-offer');

    offers.forEach(processOffer);
}

function processOffer(offer) {
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
        +priceElement.getAttribute(ATTRIBUTES.PRICE);

    const balancedCashbackPrice =
        +priceElement.getAttribute(ATTRIBUTES.BALANCED_CASHBACK_PRICE);

    const sellerRatingNumber = getElementInnerNumber(sellerRatingWrap, true);

    const shouldHide =
        isLessThanFilter(cashbackNumber, minCashbackFilter) ||
        isGreaterThanFilter(price, maxPriceFilter) ||
        isGreaterThanFilter(balancedCashbackPrice, maxDiscountedPriceFilter) ||
        isLessThanFilter(sellerRatingNumber, minSellerRatingFilter);
    updateElementDisplay(offer, shouldHide);
}
