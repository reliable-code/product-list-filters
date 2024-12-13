import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { removeNonNumber } from '../common/string';
import { getURLPathElement } from '../common/url';
import { isLessThanFilter, isNotMatchTextFilter } from '../common/filter/compare';
import { hideElement, showElement, updateElementDisplay } from '../common/dom/manipulation';
import {
    applyStyles,
    getAllElements,
    getFirstElement,
    getFirstElementInnerNumber,
} from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createSearchFilterControl,
} from '../common/filter/factories/specificControls';
import { SELECTORS } from './selectors';
import { STYLES } from './styles';
import { createFilterFactory } from '../common/filter/factories/createFilter';

const SECTION_ID = getURLPathElement(3);

const { createSectionFilter } = createFilterFactory(processProductCards, SECTION_ID);

const nameFilter = createSectionFilter('name-filter');
const minReviewsFilter = createSectionFilter('min-reviews-filter');
const minRatingFilter = createSectionFilter('min-rating-filter', 4.5);
const filterEnabled = createSectionFilter('filter-enabled', true);

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

    const nameFilterDiv = createSearchFilterControl(
        nameFilter, STYLES.CONTROL, STYLES.TEXT_INPUT,
    );
    const minReviewsDiv = createMinReviewsFilterControl(
        minReviewsFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const minRatingDiv = createMinRatingFilterControl(
        minRatingFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
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
    const productCardReviewsNode =
        [...productCardRatingWrap.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
    const productCardReviewsNumber = getProductCardReviewsNumber(productCardReviewsNode);
    const productCardRatingNumber = getFirstElementInnerNumber(productCardRatingWrap, 'b');

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
