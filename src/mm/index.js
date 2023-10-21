import { StorageValue } from '../common/storage';
import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    hideElement,
    showElement,
    showHideElement,
} from '../common/dom';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMinCashbackFilterControl,
} from '../common/filter';

const minCashbackFilter = new StorageValue('min-cashback-filter', 20);
const filterEnabled = new StorageValue('filter-enabled', true);

const PRODUCT_CARD_LIST_HEADER = '.catalog-listing-header';
const PRODUCT_CARD_SELECTOR = '.catalog-item';
const PRODUCT_CARD_PRICE_SELECTOR = '.item-price';
const PRODUCT_CARD_CASHBACK_SELECTOR = '.bonus-percent';
const BALANCED_CASHBACK_PRICE_ADDED_CLASS = 'balancedCashbackPriceAdded';

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

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    filtersContainer.append(minCashbackDiv, filterEnabledDiv);

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

            const conditionToHide = productCardCashbackNumber < minCashbackFilter.value;
            showHideElement(
                productCard, conditionToHide, 'flex',
            );

            addBalancedCashbackPriceIfNeeded(productCard, productCardCashbackNumber);
        },
    );
}

function addBalancedCashbackPriceIfNeeded(productCard, productCardCashbackNumber) {
    const productCardPrice = getFirstElement(PRODUCT_CARD_PRICE_SELECTOR, productCard);

    if (productCardPrice.classList.contains(BALANCED_CASHBACK_PRICE_ADDED_CLASS)) return;

    addBalancedCashbackPrice(productCardPrice, productCardCashbackNumber);
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

    productCardPrice.classList.add(BALANCED_CASHBACK_PRICE_ADDED_CLASS);
}

function getBalancedCashbackPrice(price, cashback) {
    const balancedCashbackUsage = getBalancedCashbackUsage(price, cashback);
    return price - balancedCashbackUsage;
}

function getBalancedCashbackUsage(price, cashback) {
    const cashbackCoeff = cashback / 100;
    return ((price * cashbackCoeff) / (1 + cashbackCoeff)).toFixed(0);
}
