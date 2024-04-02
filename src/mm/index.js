import { StoredInputValue } from '../common/localstorage';
import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    hideElement,
    InputValue,
    showElement,
    showHideElement,
} from '../common/dom';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMaxPriceFilterControl,
    createMinCashbackFilterControl,
    createNameFilterControl,
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../common/filter';

const CATEGORY_NAME = getCategoryName();

const nameFilter = new StoredInputValue(`${CATEGORY_NAME}-name-filter`);
const minCashbackFilter = new StoredInputValue(`${CATEGORY_NAME}-min-cashback-filter`);
const maxPriceFilter = new StoredInputValue(`${CATEGORY_NAME}-max-price-filter`);
const filterEnabled = new InputValue(false);

const PRODUCT_CARD_LIST_CONTROLS = '.catalog-listing-controls';
const PRODUCT_CARD_SELECTOR = '.catalog-item';
const PRODUCT_CARD_PRICE_SELECTOR = '.item-price';
const PRODUCT_CARD_CASHBACK_SELECTOR = '.bonus-percent';
const PRICE_ATTR = 'price';
const BALANCED_CASHBACK_PRICE_ATTR = 'balanced-cashback-price';

function getCategoryName() {
    const { pathname } = window.location;
    const pathElements = pathname.split('/');

    const categoryName = pathElements[2] || 'common';

    return categoryName;
}

if (isDetailsPage()) {
    setInterval(initOffersClean, 100);
} else {
    setInterval(initListClean, 100);
}

function isDetailsPage() {
    return window.location.pathname.includes('details');
}

function initOffersClean() {
    const offersSection = getFirstElement('.pdp-prices');

    if (offersSection) {
        cleanOffers();
    }
}

function initListClean() {
    const productCardListHeader = getFirstElement(PRODUCT_CARD_LIST_CONTROLS);

    if (productCardListHeader) {
        appendFilterControlsIfNeeded(productCardListHeader, appendFiltersContainer);

        cleanList();
    }
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
    const textInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 180px;';
    const numberInputStyle =
        inputStyle; // eslint-disable-line prefer-template
    const checkboxInputStyle =
        'margin-left: 7px;' +
        'width: 23px;' +
        'height: 23px;';

    const nameFilterDiv =
        createNameFilterControl(nameFilter, controlStyle, textInputStyle);

    const minCashbackDiv =
        createMinCashbackFilterControl(minCashbackFilter, controlStyle, numberInputStyle);

    const maxPriceDiv =
        createMaxPriceFilterControl(maxPriceFilter, controlStyle, numberInputStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    filtersContainer.append(nameFilterDiv, minCashbackDiv, maxPriceDiv, filterEnabledDiv);

    parentNode.append(filtersContainer);
}

function cleanOffers() {
    const offers = getAllElements('.pdp-prices .product-offer');

    offers.forEach(
        (offer) => {
            const priceWrap =
                getFirstElement('.product-offer-price__amount', offer);

            const cashbackWrap =
                getFirstElement('.bonus-percent', offer);

            if (!priceWrap || !cashbackWrap) {
                hideElement(offer);

                return;
            }

            const priceNumber = getElementInnerNumber(priceWrap, true);
            const cashbackNumber = getElementInnerNumber(cashbackWrap, true);

            const conditionToHide =
                cashbackNumber < 10;
            showHideElement(offer, conditionToHide, 'flex');
        },
    );
}

function cleanList() {
    const productCards = getAllElements(PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                showElement(productCard, 'flex');

                return;
            }

            const productCardNameWrap =
                getFirstElement('.item-title', productCard);

            const productCardCashback =
                getFirstElement(PRODUCT_CARD_CASHBACK_SELECTOR, productCard);

            if (!productCardNameWrap || !productCardCashback) {
                hideElement(productCard);

                return;
            }

            const productCardName = productCardNameWrap.innerText;

            const productCardCashbackNumber = getElementInnerNumber(productCardCashback, true);

            const productCardPrice =
                addBalancedCashbackPriceIfNeeded(productCard, productCardCashbackNumber);
            // const price =
            //     +productCardPrice.getAttribute(PRICE_ATTR);
            const balancedCashbackPrice =
                +productCardPrice.getAttribute(BALANCED_CASHBACK_PRICE_ATTR);

            const conditionToHide =
                isNotMatchTextFilter(productCardName, nameFilter) ||
                isLessThanFilter(productCardCashbackNumber, minCashbackFilter) ||
                isGreaterThanFilter(balancedCashbackPrice, maxPriceFilter);
            showHideElement(productCard, conditionToHide, 'flex');
        },
    );
}

function addBalancedCashbackPriceIfNeeded(productCard, productCardCashbackNumber) {
    const productCardPrice = getFirstElement(PRODUCT_CARD_PRICE_SELECTOR, productCard);

    if (!productCardPrice.hasAttribute(BALANCED_CASHBACK_PRICE_ATTR)) {
        addBalancedCashbackPrice(productCardPrice, productCardCashbackNumber);
    }

    return productCardPrice;
}

function addBalancedCashbackPrice(productCardPrice, productCardCashbackNumber) {
    const productCardPriceNumber =
        getElementInnerNumber(productCardPrice, true);

    const balancedCashbackPrice =
        getBalancedCashbackPrice(productCardPriceNumber, productCardCashbackNumber);

    const productCardPriceSpan =
        getFirstElement(':scope > span', productCardPrice);

    const newProductCardPriceSpanText =
        `${productCardPriceNumber.toLocaleString()} (${balancedCashbackPrice.toLocaleString()}) ₽`;
    productCardPriceSpan.innerText = newProductCardPriceSpanText;

    productCardPrice.setAttribute(PRICE_ATTR, productCardPriceNumber);
    productCardPrice.setAttribute(BALANCED_CASHBACK_PRICE_ATTR, balancedCashbackPrice);
}

function getBalancedCashbackPrice(price, cashback) {
    const balancedCashbackUsage = getBalancedCashbackUsage(price, cashback);
    return price - balancedCashbackUsage;
}

function getBalancedCashbackUsage(price, cashback) {
    const cashbackCoeff = cashback / 100;
    return ((price * cashbackCoeff) / (1 + cashbackCoeff)).toFixed(0);
}
