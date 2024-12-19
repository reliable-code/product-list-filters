import { debounce, waitForElement } from '../../../common/dom/utils';
import { getHashOrDefault } from '../../../common/hash/helpers';
import { getURLPathElementEnding } from '../../../common/url';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import { InputValue } from '../../../common/storage/models/inputValue';
import { isGreaterThanFilter, isLessThanFilter } from '../../../common/filter/compare';
import { hideElement, showElement, updateElementDisplay } from '../../../common/dom/manipulation';
import {
    applyStyles,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../../../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMaxPriceFilterControl,
    createMinCashbackFilterControl,
    createMinRatingFilterControl,
    createPriceFilterControl,
} from '../../../common/filter/factories/specificControls';
import { createNumberFilterControl } from '../../../common/filter/factories/genericControls';
import { addBalancedCashbackPriceIfNeeded } from '../common';
import { ATTRIBUTES } from '../common/attributes';
import { STYLES } from '../common/styles';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';
import { SELECTORS } from './selectors';

const PRODUCT_NAME_HASH = getHashOrDefault(getURLPathElementEnding(3));

const {
    createGlobalFilter,
    createSectionFilter,
} = createFilterFactory(processOffers, PRODUCT_NAME_HASH);

const minCashbackFilter = createSectionFilter('min-cashback-filter');
const maxPriceFilter = createSectionFilter('max-price-filter');
const maxDiscountedPriceFilter = createSectionFilter('max-discounted-price-filter');
const minSellerRatingFilter = createGlobalFilter('min-seller-rating-filter');
const couponValue = new InputValue(null, processOffers);
const filterEnabled = createGlobalFilter('filter-enabled', false);

export async function initProductPageMods() {
    await executeProductPageMods();

    const app = await waitForElement(document, SELECTORS.APP);
    const observer = new MutationObserver(debounce(executeProductPageMods));

    observer.observe(app, {
        childList: true,
    });
}

async function executeProductPageMods() {
    const offersFilter = await waitForElement(document, SELECTORS.OFFERS_FILTER);

    appendFilterControlsIfNeeded(offersFilter, appendFiltersContainer);

    processOffers();

    const offersContainer = getFirstElement(SELECTORS.OFFERS_CONTAINER);

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
        maxPriceFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT, '250',
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
    const offers = getAllElements(SELECTORS.OFFER);

    offers.forEach(processOffer);
}

function processOffer(offer) {
    if (!filterEnabled.value) {
        showElement(offer);
        return;
    }

    const priceWrap = getFirstElement(SELECTORS.PRICE, offer);
    const cashbackWrap = getFirstElement(SELECTORS.CASHBACK, offer);
    const sellerRatingWrap = getFirstElement(SELECTORS.SELLER_RATING, offer);

    if (!priceWrap || !cashbackWrap || !sellerRatingWrap) {
        hideElement(offer);
        return;
    }

    const cashbackNumber = getElementInnerNumber(cashbackWrap, true);

    const priceElement = addBalancedCashbackPriceIfNeeded(
        offer, SELECTORS.PRICE, cashbackNumber, couponValue.value,
    );

    const price = +priceElement.getAttribute(ATTRIBUTES.PRICE);
    const balancedCashbackPrice = +priceElement.getAttribute(ATTRIBUTES.BALANCED_CASHBACK_PRICE);
    const sellerRatingNumber = getElementInnerNumber(sellerRatingWrap, true);

    const shouldHide =
        isLessThanFilter(cashbackNumber, minCashbackFilter) ||
        isGreaterThanFilter(price, maxPriceFilter) ||
        isGreaterThanFilter(balancedCashbackPrice, maxDiscountedPriceFilter) ||
        isLessThanFilter(sellerRatingNumber, minSellerRatingFilter);

    updateElementDisplay(offer, shouldHide);
}
