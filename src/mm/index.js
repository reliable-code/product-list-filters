import { StorageValue } from '../common/storage';
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
    isGreaterThanFilter,
    isLessThanFilter,
} from '../common/filter';

const minCashbackFilter = new StorageValue('min-cashback-filter');
const maxPriceFilter = new StorageValue('max-price-filter');
const filterEnabled = new InputValue(false);

const PRODUCT_CARD_LIST_HEADER = '.catalog-listing-header';
const PRODUCT_CARD_SELECTOR = '.catalog-item';
const PRODUCT_CARD_PRICE_SELECTOR = '.item-price';
const PRODUCT_CARD_CASHBACK_SELECTOR = '.bonus-percent';
const PRICE_ATTR = 'price';
const BALANCED_CASHBACK_PRICE_ATTR = 'balanced-cashback-price';

setInterval(initListClean, 100);

function initListClean() {
    const productCardListHeader = getFirstElement(PRODUCT_CARD_LIST_HEADER);

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
        'margin-left: 7px;';
    const numberInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'padding: 8px 14px;';
    const checkboxInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 23px;' +
        'height: 23px;';

    const minCashbackDiv =
        createMinCashbackFilterControl(minCashbackFilter, controlStyle, numberInputStyle);

    const maxPriceDiv =
        createMaxPriceFilterControl(maxPriceFilter, controlStyle, numberInputStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    filtersContainer.append(minCashbackDiv, maxPriceDiv, filterEnabledDiv);

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

            const productCardCashback =
                getFirstElement(PRODUCT_CARD_CASHBACK_SELECTOR, productCard);

            if (!productCardCashback) {
                hideElement(productCard);

                return;
            }

            const productCardCashbackNumber = getElementInnerNumber(productCardCashback, true);

            const productCardPrice =
                addBalancedCashbackPriceIfNeeded(productCard, productCardCashbackNumber);
            // const price =
            //     +productCardPrice.getAttribute(PRICE_ATTR);
            const balancedCashbackPrice =
                +productCardPrice.getAttribute(BALANCED_CASHBACK_PRICE_ATTR);

            const conditionToHide =
                isLessThanFilter(productCardCashbackNumber, minCashbackFilter.value) ||
                isGreaterThanFilter(balancedCashbackPrice, maxPriceFilter.value);
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
