import { debounce, waitForElement } from '../../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import { addBalancedCashbackPriceIfNeeded } from '../common/common';
import { getURLPathElement } from '../../../common/url';
import { InputValue } from '../../../common/storage/models/inputValue';
import {
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../../../common/filter/compare';
import { createTextFilterControl } from '../../../common/filter/factories/genericControls';
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
    createMinDiscountFilterControl,
    createSearchFilterControl,
} from '../../../common/filter/factories/specificControls';
import { ATTRIBUTES } from '../common/attributes';
import { STYLES } from '../common/styles';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';
import { getHashOrDefault } from '../../../common/hash/helpers';
import { SELECTORS } from './selectors';

const SECTION_ID = getHashOrDefault(getURLPathElement(2));

const { createSectionFilter } = createFilterFactory(processProductCards, SECTION_ID);

const nameFilter = createSectionFilter('name-filter');
const minCashbackFilter = createSectionFilter('min-cashback-filter');
const maxPriceFilter = createSectionFilter('max-price-filter');
const minDiscountFilter = createSectionFilter('min-discount-filter');
const sellerNameFilter = createSectionFilter('seller-name-filter');
const filterEnabled = new InputValue(false, processProductCards);

export async function initProductListMods() {
    await executeProductListMods();

    const app = await waitForElement(document, '#app');
    const observer = new MutationObserver(debounce(executeProductListMods));

    observer.observe(app, {
        childList: true,
        subtree: true,
    });
}

async function executeProductListMods() {
    const productCardListHeader = await waitForElement(
        document, SELECTORS.PRODUCT_CARD_LIST_HEADER,
    );

    appendFilterControlsIfNeeded(productCardListHeader, appendFiltersContainer);

    const productCardListContainer = productCardListHeader.parentNode;

    if (productCardListContainer.hasAttribute(ATTRIBUTES.OBSERVED)) return;

    const observer = new MutationObserver(debounce(processProductCards, 50));

    observer.observe(productCardListContainer, {
        childList: true,
        subtree: true,
    });

    productCardListContainer.setAttribute(ATTRIBUTES.OBSERVED, '');
}

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
    const productCards = getAllElements(SELECTORS.PRODUCT_CARD);

    productCards.forEach(processProductCard);
}

function processProductCard(productCard) {
    if (!filterEnabled.value) {
        showElement(productCard);
        return;
    }

    const nameWrap =
        getFirstElement(SELECTORS.PRODUCT_CARD_TITLE, productCard);

    const cashbackWrap =
        getFirstElement(SELECTORS.PRODUCT_CARD_CASHBACK, productCard);

    const discountWrap =
        getFirstElement(SELECTORS.PRODUCT_CARD_DISCOUNT, productCard);

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
            productCard, SELECTORS.PRODUCT_CARD_PRICE, cashbackNumber,
        );

    const balancedCashbackPrice =
        +priceElement.getAttribute(ATTRIBUTES.BALANCED_CASHBACK_PRICE);

    const sellerNameWrap =
        getFirstElement(SELECTORS.PRODUCT_CARD_SELLER_NAME, productCard);

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
