import { StoredInputValue } from '../common/storage/localstorage';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { removeNonNumber } from '../common/string';
import { getURLPathElement } from '../common/url';
import { isLessThanFilter, isNotMatchTextFilter } from '../common/filter/compare';
import { hideElement, showElement, updateElementDisplay } from '../common/dom/manipulation';
import { applyStyles, getAllElements, getFirstElement } from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createSearchFilterControl,
} from '../common/filter/factories/specificControls';
import { SELECTORS } from './selectors';

const STYLES_BASE = {
    INPUT: {
        marginLeft: '6px',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        padding: '7px 14px',
        fontSize: '15px',
    },
};
const STYLES = {
    FILTERS_CONTAINER: {
        display: 'flex',
        gridGap: '12px',
        paddingBottom: '12px',
    },
    CONTROL: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '15px',
    },
    INPUT: STYLES_BASE.INPUT,
    TEXT_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '180px',
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '90px',
    },
    CHECKBOX_INPUT: {
        marginLeft: '6px',
        width: '21px',
        height: '21px',
    },
};

const SECTION_ID = getURLPathElement(3);

function createFilter(filterName, defaultValue = null) {
    return StoredInputValue.createWithCompositeKey(
        SECTION_ID, filterName, defaultValue, processProductCards,
    );
}

const nameFilter = createFilter('name-filter');
const minReviewsFilter = createFilter('min-reviews-filter');
const minRatingFilter = createFilter('min-rating-filter', 4.5);
const filterEnabled = createFilter('filter-enabled', true);

const productsPageList = getFirstElement(SELECTORS.PRODUCTS_PAGE_LIST);

if (productsPageList) {
    initListClean();
}

function initListClean() {
    const topFilters = getFirstElement(SELECTORS.TOP_FILTERS, productsPageList, true);
    const productList = getFirstElement(SELECTORS.PRODUCTS_LIST, productsPageList, true);

    appendFilterControlsIfNeeded(topFilters, appendFiltersContainer);

    new MutationObserver(processProductCards).observe(productList, {
        childList: true,
        subtree: true,
    });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);

    const controlStyle = STYLES.CONTROL;
    const inputStyle = STYLES.INPUT;
    const textInputStyle = STYLES.TEXT_INPUT;
    const numberInputStyle = STYLES.NUMBER_INPUT;
    const checkboxInputStyle = STYLES.CHECKBOX_INPUT;

    const nameFilterDiv = createSearchFilterControl(
        nameFilter, controlStyle, textInputStyle,
    );
    const minReviewsDiv = createMinReviewsFilterControl(
        minReviewsFilter, controlStyle, numberInputStyle,
    );
    const minRatingDiv = createMinRatingFilterControl(
        minRatingFilter, controlStyle, numberInputStyle, 0.5,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, controlStyle, checkboxInputStyle,
    );

    filtersContainer.append(
        nameFilterDiv, minReviewsDiv, minRatingDiv, filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
}

function processProductCards() {
    const productCards = getAllElements(
        `${SELECTORS.PRODUCTS_PAGE_LIST} ${SELECTORS.PRODUCT}`,
    );

    productCards.forEach(processProductCard);
}

function processProductCard(productCard) {
    if (!filterEnabled.value) {
        showElement(productCard);
        return;
    }

    const productCardNameWrap = getFirstElement(SELECTORS.PRODUCT_NAME, productCard);
    const productCardRatingWrap = getFirstElement(SELECTORS.PRODUCT_RATING, productCard);

    if (!productCardNameWrap || !productCardRatingWrap) {
        hideElement(productCard);
        return;
    }

    const productCardName = productCardNameWrap.innerText;
    const productCardReviewsNumber = getProductCardReviewsNumber(productCardRatingWrap);
    const productCardRatingNumber = +productCardRatingWrap.getAttribute('data-rating');

    const shouldHide =
        isNotMatchTextFilter(productCardName, nameFilter) ||
        isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
        isLessThanFilter(productCardRatingNumber, minRatingFilter);

    updateElementDisplay(productCard, shouldHide);
}

function getProductCardReviewsNumber(productCardRatingWrap) {
    const productCardReviewsText = productCardRatingWrap.textContent;
    let productCardReviewsNumber = +removeNonNumber(productCardReviewsText);

    if (productCardReviewsText.includes('k')) {
        productCardReviewsNumber *= 1000;
    }

    return productCardReviewsNumber;
}
