import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { getURLPathElement } from '../common/url';
import { isLessThanFilter, isNotMatchTextFilter } from '../common/filter/compare';
import {
    applyStyles,
    hideElement,
    showElement,
    updateElementDisplay,
} from '../common/dom/manipulation';
import {
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
import { debounce } from '../common/dom/utils';
import { getHashOrDefault } from '../common/hash/helpers';

const SECTION_ID = getHashOrDefault(getURLPathElement(3));

const { createSectionFilter } = createFilterFactory(processProductCards, SECTION_ID);

const nameFilter = createSectionFilter('name-filter');
const minReviewsFilter = createSectionFilter('min-reviews-filter');
const minRatingFilter = createSectionFilter('min-rating-filter', 4.5);
const filterEnabled = createSectionFilter('filter-enabled', true);

const productsListContainer = getFirstElement(SELECTORS.PRODUCT_LIST_CONTAINER);

if (productsListContainer) {
    new MutationObserver(debounce(initListClean)).observe(productsListContainer, {
        childList: true,
        subtree: true,
    });
}

function initListClean() {
    const productList = getFirstElement(SELECTORS.PRODUCT_LIST, productsListContainer);
    if (!productList) return;

    appendFilterControlsIfNeeded(productList.parentNode, appendFiltersContainer);

    processProductCards();

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

    parentNode.prepend(filtersContainer);
}

function processProductCards() {
    const productCards = getAllElements(SELECTORS.PRODUCT);

    productCards.forEach(processProductCard);
}

function processProductCard(productCard) {
    if (!filterEnabled.value) {
        showElement(productCard);
        return;
    }

    const nameWrap = getFirstElement(SELECTORS.PRODUCT_NAME, productCard);
    const ratingWrap = getFirstElement(SELECTORS.PRODUCT_RATING, productCard);

    if (!nameWrap || !ratingWrap) {
        hideElement(productCard);
        return;
    }

    const name = nameWrap.innerText;
    const reviewsCount = getFirstElementInnerNumber(ratingWrap, 'div:nth-child(2)', true);
    const rating = getFirstElementInnerNumber(ratingWrap, 'div:nth-child(1) > span');

    const shouldHide =
        isNotMatchTextFilter(name, nameFilter) ||
        isLessThanFilter(reviewsCount, minReviewsFilter) ||
        isLessThanFilter(rating, minRatingFilter);

    updateElementDisplay(productCard, shouldHide);
}
