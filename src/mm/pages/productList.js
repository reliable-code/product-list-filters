import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    hideElement,
    InputValue,
    showElement,
    showHideElement,
} from '../../common/dom';
import { StoredInputValue } from '../../common/localstorage';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMaxPriceFilterControl,
    createMinCashbackFilterControl,
    createNameFilterControl,
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../../common/filter';

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

export function initListClean() {
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
                addBalancedCashbackPriceIfNeeded(
                    productCard, productCardCashbackNumber, PRODUCT_CARD_PRICE_SELECTOR,
                );
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

function addBalancedCashbackPriceIfNeeded(priceParent, cashbackNumber, priceSelector) {
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

    const priceSpan =
        getFirstElement(':scope > span', priceElement);

    const newPriceSpanText =
        `${priceNumber.toLocaleString()} (${balancedCashbackPrice.toLocaleString()}) ₽`;
    priceSpan.innerText = newPriceSpanText;

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
