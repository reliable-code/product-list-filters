import {
    debounce,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    hideElement,
    InputValue,
    showElement,
    showHideElement,
    waitForElement,
} from '../../common/dom';
import { StoredInputValue } from '../../common/storage';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMaxPriceFilterControl,
    createMinCashbackFilterControl,
    createMinDiscountFilterControl,
    createNameFilterControl,
    createSellerNameFilterControl,
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../../common/filter';
import { addBalancedCashbackPriceIfNeeded, BALANCED_CASHBACK_PRICE_ATTR } from './common/common';
import { getURLPathElement } from '../../common/url';

const CATEGORY_NAME = getURLPathElement(2);
const nameFilter =
    new StoredInputValue(`${CATEGORY_NAME}-name-filter`, null, cleanList);
const minCashbackFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-cashback-filter`, null, cleanList);
const maxPriceFilter =
    new StoredInputValue(`${CATEGORY_NAME}-max-price-filter`, null, cleanList);
const minDiscountFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-discount-filter`, null, cleanList);
const sellerNameFilter =
    new StoredInputValue(`${CATEGORY_NAME}-seller-name-filter`, null, cleanList);
const filterEnabled =
    new InputValue(false, cleanList);
const PRODUCT_CARD_LIST_CONTROLS = '.catalog-listing-controls';
const PRODUCT_CARD_SELECTOR = '.catalog-item-desktop';
const PRODUCT_CARD_PRICE_SELECTOR = '.catalog-item-regular-desktop__price';
const PRODUCT_CARD_CASHBACK_SELECTOR = '.bonus-percent';

export function initProductListMods() {
    waitForElement(document, PRODUCT_CARD_LIST_CONTROLS)
        .then((productCardListHeader) => {
            const productCardListContainer = productCardListHeader.parentNode;

            const observer = new MutationObserver(debounce(initListClean, 50));

            observer.observe(productCardListContainer, {
                childList: true,
                subtree: true,
            });
        });
}

function initListClean() {
    const productCardListHeader = getFirstElement(PRODUCT_CARD_LIST_CONTROLS);

    appendFilterControlsIfNeeded(productCardListHeader, appendFiltersContainer);

    cleanList();
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

    const minDiscountDiv =
        createMinDiscountFilterControl(minDiscountFilter, controlStyle, numberInputStyle);

    const sellerNameFilterDiv =
        createSellerNameFilterControl(sellerNameFilter, controlStyle, textInputStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    filtersContainer.append(
        nameFilterDiv,
        minCashbackDiv,
        maxPriceDiv,
        minDiscountDiv,
        sellerNameFilterDiv,
        filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
}

function cleanList() {
    const productCards = getAllElements(PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                showElement(productCard);

                return;
            }

            const nameWrap =
                getFirstElement('.catalog-item-regular-desktop__title-link', productCard);

            const cashbackWrap =
                getFirstElement(PRODUCT_CARD_CASHBACK_SELECTOR, productCard);

            const discountWrap =
                getFirstElement('.discount-percentage__value', productCard);

            if (!nameWrap) {
                hideElement(productCard);

                return;
            }

            const name = nameWrap.innerText;

            const cashbackNumber =
                getElementInnerNumber(cashbackWrap, true, false, 0);

            const discountValue =
                Math.abs(
                    getElementInnerNumber(discountWrap, true, false, 0),
                );

            const priceElement =
                addBalancedCashbackPriceIfNeeded(
                    productCard, PRODUCT_CARD_PRICE_SELECTOR, cashbackNumber,
                );

            const balancedCashbackPrice =
                +priceElement.getAttribute(BALANCED_CASHBACK_PRICE_ATTR);

            const sellerNameWrap =
                getFirstElement('.merchant-info__name', productCard);

            const sellerNameIsNotMatchFilter =
                sellerNameWrap ?
                    isNotMatchTextFilter(sellerNameWrap.innerText, sellerNameFilter) :
                    false;

            const conditionToHide =
                isNotMatchTextFilter(name, nameFilter) ||
                isLessThanFilter(cashbackNumber, minCashbackFilter) ||
                isGreaterThanFilter(balancedCashbackPrice, maxPriceFilter) ||
                isLessThanFilter(discountValue, minDiscountFilter) ||
                sellerNameIsNotMatchFilter;
            showHideElement(productCard, conditionToHide);
        },
    );
}
