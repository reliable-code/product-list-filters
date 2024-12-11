import { debounce } from '../common/dom/utils';
import { StoredInputValue } from '../common/storage/localstorage';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { isLessThanFilter } from '../common/filter/compare';
import {
    hideElement,
    insertAfter,
    showElement,
    updateElementDisplay,
} from '../common/dom/manipulation';
import {
    applyStyles,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
} from '../common/filter/factories/specificControls';
import { STYLES } from './styles';
import { getURLPathElement } from '../common/url';

const SEARCH_CONTROLS_SELECTOR = '[data-apiary-widget-name="@search/Controls"]';

const CATEGORY_NAME = getURLPathElement(1);

const minReviewsFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-reviews-filter`, null, processProductCards);
const minRatingFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-rating-filter`, 4.8, processProductCards);
const filterEnabled =
    new StoredInputValue(`${CATEGORY_NAME}-filter-enabled`, true, processProductCards);

const searchControls = getFirstElement(SEARCH_CONTROLS_SELECTOR);

if (searchControls) {
    appendFilterControlsIfNeeded(searchControls, appendFiltersContainer);

    initProductListMods();
}

export function initProductListMods() {
    processProductCards();

    const searchResults = getFirstElement('[data-zone-name="searchResults"]');
    const observer = new MutationObserver(debounce(processProductCards, 50));

    observer.observe(searchResults, {
        childList: true,
        subtree: true,
    });
}

function appendFiltersContainer(filterControls, parentNode) {
    applyStyles(filterControls, STYLES.FILTER_CONTROLS);

    const minReviewsDiv = createMinReviewsFilterControl(
        minReviewsFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const minRatingDiv = createMinRatingFilterControl(
        minRatingFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );

    filterControls.append(minReviewsDiv, minRatingDiv, filterEnabledDiv);

    insertAfter(parentNode, filterControls);
}

function processProductCards() {
    const productCards = getAllElements('[data-apiary-widget-name="@marketfront/SerpEntity"]');

    productCards.forEach(processProductCard);
}

function processProductCard(productCard) {
    if (!filterEnabled.value) {
        showElement(productCard);
        return;
    }

    const productCardName = getFirstElement('[data-baobab-name="title"]', productCard);
    const productCardReviewsWrap = getFirstElement('[data-auto="reviews"]', productCard);

    if (!productCardName || !productCardReviewsWrap) {
        hideElement(productCard);
        return;
    }

    const productCardReviewsNumber = getElementInnerNumber(
        productCardReviewsWrap.children[1], true,
    );
    const productCardRatingNumber = getElementInnerNumber(
        productCardReviewsWrap.children[0], true,
    );

    const shouldHide =
        isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
        isLessThanFilter(productCardRatingNumber, minRatingFilter);
    updateElementDisplay(productCard, shouldHide);
}
