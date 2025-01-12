import { waitForElement } from '../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { getURLPathElementEnding, pathnameIncludesSome } from '../common/url';
import { isLessThanFilter, isNotMatchTextFilter } from '../common/filter/compare';
import {
    applyStyles,
    hideElement,
    showElement,
    updateElementDisplay,
} from '../common/dom/manipulation';
import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    getNodeInnerNumber,
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

let nameFilter;
let minReviewsFilter;
let minRatingFilter;
let filterEnabled;

(function initDocumentObserver() {
    const { documentElement } = document;

    const observer = new MutationObserver(async () => {
        if (documentElement.classList.contains('nprogress-busy')) return;

        if (pathnameIncludesSome(['category', 'search'])) {
            await initProcessProductCards();
        }
    });

    observer.observe(documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });
}());

async function initProcessProductCards() {
    const notification = await waitForElement(document, SELECTORS.NOTIFICATION);
    const promotional = getFirstElement(SELECTORS.PROMOTIONAL_SHELF, notification);
    if (promotional) promotional.remove();

    appendFilterControlsIfNeeded(notification, appendFiltersContainer, true);

    const productCardsWrap = getFirstElement(
        SELECTORS.CATEGORY_PRODUCTS, document, true,
    );
    new MutationObserver(processProductCards).observe(productCardsWrap, { childList: true });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    initFilters();

    applyStyles(filtersContainer, STYLES.filtersContainer);

    const nameFilterDiv = createSearchFilterControl(
        nameFilter, STYLES.control, STYLES.textInput,
    );
    const minReviewsDiv = createMinReviewsFilterControl(
        minReviewsFilter, STYLES.control, STYLES.numberInput,
    );
    const minRatingDiv = createMinRatingFilterControl(
        minRatingFilter, STYLES.control, STYLES.numberInput,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.control, STYLES.checkboxInput,
    );

    filtersContainer.append(
        nameFilterDiv, minReviewsDiv, minRatingDiv, filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
}

function initFilters() {
    const sectionId = getURLPathElementEnding(2);
    const { createSectionFilter } = createFilterFactory(processProductCards, sectionId);

    nameFilter = createSectionFilter('name-filter');
    minReviewsFilter = createSectionFilter('min-reviews-filter');
    minRatingFilter = createSectionFilter('min-rating-filter', 4.8);
    filterEnabled = createSectionFilter('filter-enabled', true);
}

function processProductCards() {
    const productCardsWrap = getFirstElement(
        SELECTORS.CATEGORY_PRODUCTS, document, true,
    );
    const productCards = getAllElements(
        SELECTORS.PRODUCT_CARD, productCardsWrap,
    );

    productCards.forEach(processProductCard);
}

function processProductCard(productCard) {
    if (!filterEnabled.value) {
        showElement(productCard);
        return;
    }

    const productCardNameWrap = getFirstElement(
        SELECTORS.PRODUCT_CARD_NAME_WRAP, productCard,
    );
    const productCardRatingWrap = getFirstElement(
        SELECTORS.PRODUCT_CARD_RATING_WRAP, productCard,
    );
    const productCardRating = getFirstElement(
        SELECTORS.PRODUCT_CARD_RATING, productCardRatingWrap,
    );

    if (!productCardNameWrap || !productCardRating) {
        hideElement(productCard);
        return;
    }

    const productCardName = productCardNameWrap.innerText;
    const productCardReviewsNumber = getNodeInnerNumber(
        productCardRatingWrap.childNodes[1], true,
    );
    const productCardRatingNumber = getElementInnerNumber(
        productCardRating, true,
    );

    const shouldHide =
        isNotMatchTextFilter(productCardName, nameFilter) ||
        isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
        isLessThanFilter(productCardRatingNumber, minRatingFilter);
    updateElementDisplay(productCard, shouldHide);
}
