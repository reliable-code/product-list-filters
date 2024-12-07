import { debounce, waitForElement } from '../../common/dom/utils';
import { StoredInputValue } from '../../common/storage/storage';
import { appendFilterControlsIfNeeded } from '../../common/filter/manager';
import { addBalancedCashbackPriceIfNeeded } from './common/common';
import { getURLPathElement } from '../../common/url';
import { InputValue } from '../../common/storage/models/inputValue';
import {
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../../common/filter/compare';
import { createTextFilterControl } from '../../common/filter/factories/genericControls';
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
    createMinDiscountFilterControl,
    createSearchFilterControl,
} from '../../common/filter/factories/specificControls';
import { ATTRIBUTES } from './common/attributes';

const SECTION_ID = getURLPathElement(2);
const nameFilter =
    new StoredInputValue(`${SECTION_ID}-name-filter`, null, processProductCards);
const minCashbackFilter =
    new StoredInputValue(`${SECTION_ID}-min-cashback-filter`, null, processProductCards);
const maxPriceFilter =
    new StoredInputValue(`${SECTION_ID}-max-price-filter`, null, processProductCards);
const minDiscountFilter =
    new StoredInputValue(`${SECTION_ID}-min-discount-filter`, null, processProductCards);
const sellerNameFilter =
    new StoredInputValue(`${SECTION_ID}-seller-name-filter`, null, processProductCards);
const filterEnabled =
    new InputValue(false, processProductCards);
const PRODUCT_CARD_LIST_CONTROLS = '.catalog-listing-controls';
const PRODUCT_CARD_SELECTOR = '.catalog-item-desktop';
const PRODUCT_CARD_PRICE_SELECTOR = '.catalog-item-regular-desktop__price';
const PRODUCT_CARD_CASHBACK_SELECTOR = '.bonus-percent';

export function initProductListMods() {
    executeProductListMods();

    waitForElement(document, '#app')
        .then((app) => {
            const observer = new MutationObserver(debounce(executeProductListMods));

            observer.observe(app, {
                childList: true,
                subtree: true,
            });
        });
}

function executeProductListMods() {
    waitForElement(document, PRODUCT_CARD_LIST_CONTROLS)
        .then((productCardListHeader) => {
            appendFilterControlsIfNeeded(productCardListHeader, appendFiltersContainer);

            const productCardListContainer = productCardListHeader.parentNode;

            if (productCardListContainer.hasAttribute('observed')) return;

            const observer = new MutationObserver(debounce(processProductCards, 50));

            observer.observe(productCardListContainer, {
                childList: true,
                subtree: true,
            });

            productCardListContainer.setAttribute('observed', '');
        });
}

const STYLES_BASE = {
    INPUT: {
        border: '1px solid #e4ebf0',
        fontSize: '14px',
        borderRadius: '8px',
        marginLeft: '7px',
        padding: '8px 14px',
    },
};

const STYLES = {
    CONTAINER: {
        display: 'flex',
        gridGap: '15px',
        padding: '14px 5px',
    },
    CONTROL: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
    },
    TEXT_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '180px',
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
    },
    CHECKBOX_INPUT: {
        marginLeft: '7px',
        width: '23px',
        height: '23px',
    },
};

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.CONTAINER);

    const nameFilterDiv = createSearchFilterControl(
        nameFilter, STYLES.CONTROL, STYLES.TEXT_INPUT,
    );
    const minCashbackDiv = createMinCashbackFilterControl(
        minCashbackFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const maxPriceDiv = createMaxPriceFilterControl(
        maxPriceFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const minDiscountDiv = createMinDiscountFilterControl(
        minDiscountFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );

    const sellerNameFilterDiv = createTextFilterControl(
        'Продавец: ', sellerNameFilter, STYLES.CONTROL, STYLES.TEXT_INPUT,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );

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

function processProductCards() {
    const productCards = getAllElements(PRODUCT_CARD_SELECTOR);

    productCards.forEach(processProductCard);
}

function processProductCard(productCard) {
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
        +priceElement.getAttribute(ATTRIBUTES.BALANCED_CASHBACK_PRICE);

    const sellerNameWrap =
        getFirstElement('.merchant-info__name', productCard);

    const sellerNameIsNotMatchFilter =
        sellerNameWrap ?
            isNotMatchTextFilter(sellerNameWrap.innerText, sellerNameFilter) :
            false;

    const shouldHide =
        isNotMatchTextFilter(name, nameFilter) ||
        isLessThanFilter(cashbackNumber, minCashbackFilter) ||
        isGreaterThanFilter(balancedCashbackPrice, maxPriceFilter) ||
        isLessThanFilter(discountValue, minDiscountFilter) ||
        sellerNameIsNotMatchFilter;
    updateElementDisplay(productCard, shouldHide);
}
