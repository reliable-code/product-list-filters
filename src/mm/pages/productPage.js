import {
    debounce,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    getURLPathElement,
    hideElement,
    showElement,
    showHideElement,
    waitForElement,
} from '../../common/dom';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMaxPriceFilterControl,
    createMinCashbackFilterControl,
    isGreaterThanFilter,
    isLessThanFilter,
} from '../../common/filter';

import { StoredInputValue } from '../../common/storage';
import { addBalancedCashbackPriceIfNeeded, BALANCED_CASHBACK_PRICE_ATTR } from './common/common';

const PRODUCT_NAME = getProductArticle();
const minCashbackFilter =
    new StoredInputValue(`${PRODUCT_NAME}-min-cashback-filter`, null, cleanOffers);
const maxPriceFilter =
    new StoredInputValue(`${PRODUCT_NAME}-max-price-filter`, null, cleanOffers);
const filterEnabled =
    new StoredInputValue('filter-enabled', false, cleanOffers);

function getProductArticle() {
    const productName = getURLPathElement(3);

    if (!productName) return 'default';

    const productArticle = productName.split('-')
        .at(-1);

    return productArticle;
}

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
        createMinCashbackFilterControl(minCashbackFilter, controlStyle, numberInputStyle);

    const maxPriceDiv =
        createMaxPriceFilterControl(maxPriceFilter, controlStyle, numberInputStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    filtersContainer.append(minCashbackDiv, maxPriceDiv, filterEnabledDiv);

    parentNode.append(filtersContainer);
}

function cleanOffers() {
    const offers = getAllElements('.pdp-prices .product-offer');

    offers.forEach(
        (offer) => {
            if (!filterEnabled.value) {
                showElement(offer, 'flex');

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
                addBalancedCashbackPriceIfNeeded(offer, '.product-offer-price__amount', cashbackNumber);

            const balancedCashbackPrice =
                +priceElement.getAttribute(BALANCED_CASHBACK_PRICE_ATTR);

            const conditionToHide =
                isLessThanFilter(cashbackNumber, minCashbackFilter) ||
                isGreaterThanFilter(balancedCashbackPrice, maxPriceFilter);
            showHideElement(offer, conditionToHide, 'flex');
        },
    );
}
