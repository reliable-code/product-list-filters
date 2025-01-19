import { debounce } from '../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { isLessThanFilter, isNotMatchTextFilter } from '../common/filter/compare';
import {
    applyStyles,
    hideElement,
    insertAfter,
    showElement,
    updateElementDisplay,
} from '../common/dom/manipulation';
import { getAllElements, getElementInnerNumber, getFirstElement } from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createSearchFilterControl,
} from '../common/filter/factories/specificControls';
import { STYLES } from './styles';
import { getHashOrDefault } from '../common/hash/helpers';
import { getURLPathElement } from '../common/url';
import { SELECTORS } from './selectors';
import { createFilterFactory } from '../common/filter/factories/createFilter';

const SECTION_ID = getHashOrDefault(getURLPathElement(1));

const { createSectionFilter } = createFilterFactory(processProductCards, SECTION_ID);

const nameFilter = createSectionFilter('name-filter');
const minReviewsFilter = createSectionFilter('min-reviews-filter');
const minRatingFilter = createSectionFilter('min-rating-filter', 4.8);
const filterEnabled = createSectionFilter('filter-enabled', true);

const searchControls = getFirstElement(SELECTORS.SEARCH_CONTROLS);

if (searchControls) {
    appendFilterControlsIfNeeded(searchControls, appendFiltersContainer);
    initProductListMods();
}

export function initProductListMods() {
    processProductCards();

    const searchResults = getFirstElement(SELECTORS.SEARCH_RESULTS);
    const observer = new MutationObserver(debounce(processProductCards, 50));

    observer.observe(searchResults, {
        childList: true,
        subtree: true,
    });
}

function appendFiltersContainer(filterControls, parentNode) {
    addInputSpinnerButtons();

    applyStyles(filterControls, STYLES.FILTER_CONTROLS);

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

    filterControls.append(
        nameFilterDiv, minReviewsDiv, minRatingDiv, filterEnabledDiv,
    );

    insertAfter(parentNode, filterControls);
}

function addInputSpinnerButtons() {
    window.GM_addStyle(`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
            display: block; 
        }
    `);
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

    const nameWrap = getFirstElement(SELECTORS.PRODUCT_CARD_NAME_WRAP, productCard);
    const reviewsWrap = getFirstElement(SELECTORS.PRODUCT_CARD_REVIEWS_WRAP, productCard);

    if (!nameWrap || !reviewsWrap) {
        hideElement(productCard);
        return;
    }

    const name = nameWrap.innerText;
    const reviewsCount = getElementInnerNumber(reviewsWrap.children[1], true);
    const rating = getElementInnerNumber(reviewsWrap.children[0], true);

    const shouldHide =
        isNotMatchTextFilter(name, nameFilter) ||
        isLessThanFilter(reviewsCount, minReviewsFilter) ||
        isLessThanFilter(rating, minRatingFilter);
    updateElementDisplay(productCard, shouldHide);
}
