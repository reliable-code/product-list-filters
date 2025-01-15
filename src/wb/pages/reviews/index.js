import { debounce, waitForElement } from '../../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    getFirstTextNode,
} from '../../../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMaxRatingFilterControl,
    createMinRatingFilterControl,
    createWaitFullLoadFilterControl,
} from '../../../common/filter/factories/specificControls';
import { STYLES } from './styles';
import { SELECTORS } from './selectors';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';
import {
    applyStyles,
    hideElement,
    showElement,
    updateElementDisplay,
} from '../../../common/dom/manipulation';
import {
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../../../common/filter/compare';
import { addScrollToFiltersButton, getProductArticleFromPathname } from '../common';
import { removeHighlights } from '../../../common/dom/highlighting';
import {
    highlightSearchStringsByFilter,
    highlightSearchStringsByFilterMultiple,
} from '../../../common/filter/highlighting';
import { createTextFilterControl } from '../../../common/filter/factories/genericControls';
import { createSeparator } from '../../../common/filter/factories/helpers';
import {
    getReviewsLastProductArticle,
    setReviewsLastProductArticle,
    setStoredRatingValue,
} from '../../../common/db/specific';
import { getAverageRating } from '../../../common/rating/helpers';

const { createGlobalFilter } = createFilterFactory(processReviewCards);

const variationFilter = createGlobalFilter('reviews-variation-filter');
const reviewTextFilter = createGlobalFilter('reviews-text-filter');
const minRatingFilter = createGlobalFilter('reviews-min-rating-filter');
const maxRatingFilter = createGlobalFilter('reviews-max-rating-filter');
const waitFullLoad = createGlobalFilter('reviews-wait-full-load', false);
const filterEnabled = createGlobalFilter('reviews-filter-enabled', true);

const state = {
    productArticle: null,
    totalReviewCount: null,
    stickyReviewsInfo: null,
    stickyReviewsInfoDefaultText: null,
    averageRatingWrap: null,
    stickyAverageRatingNode: null,
    reviewsContainerObserver: null,
    isAverageRatingFinalized: false,
    reviewCardsCache: new Map(),
};

export async function initReviewsMods() {
    await initVariables();
    resetFiltersIfNotLastProduct();

    const controlsContainer = await waitForElement(document, SELECTORS.CONTROLS_CONTAINER);
    appendFilterControlsIfNeeded(controlsContainer, appendFiltersContainer);

    processReviewCards();

    initReviewsContainerObserver();
}

async function initVariables() {
    if (state.productArticle) return;

    state.productArticle = getProductArticleFromPathname();

    const totalReviewCountWrap = await waitForElement(document, SELECTORS.TOTAL_REVIEWS_COUNT_WRAP);
    state.totalReviewCount = getElementInnerNumber(totalReviewCountWrap);

    state.stickyReviewsInfo = getFirstElement(SELECTORS.STICKY_REVIEWS_INFO);
    state.stickyReviewsInfoDefaultText = state.stickyReviewsInfo.textContent.trim();

    const stickyAverageRatingWrap = getFirstElement(SELECTORS.STICKY_AVERAGE_RATING_WRAP);
    state.averageRatingWrap = getFirstElement(SELECTORS.AVERAGE_RATING_WRAP);

    if (!stickyAverageRatingWrap || !state.averageRatingWrap) return;

    state.stickyAverageRatingNode = getFirstTextNode(stickyAverageRatingWrap);
}

function resetFiltersIfNotLastProduct() {
    const lastProductArticle = getReviewsLastProductArticle();

    if (state.productArticle !== lastProductArticle) {
        variationFilter.resetValue();
        reviewTextFilter.resetValue();
        minRatingFilter.resetValue();
        maxRatingFilter.resetValue();
    }

    setReviewsLastProductArticle(state.productArticle);
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);
    filtersContainer.classList.add('input-search');

    const variationFilterDiv = createTextFilterControl(
        'Вариация:',
        variationFilter,
        STYLES.CONTROL,
        STYLES.TEXT_INPUT,
    );
    const reviewTextFilterDiv = createTextFilterControl(
        'Текст:',
        reviewTextFilter,
        STYLES.CONTROL,
        STYLES.TEXT_INPUT,
    );
    const minRatingDiv = createMinRatingFilterControl(
        minRatingFilter,
        STYLES.CONTROL,
        STYLES.NUMBER_INPUT,
        1,
        1,
    );
    const maxRatingDiv = createMaxRatingFilterControl(
        maxRatingFilter,
        STYLES.CONTROL,
        STYLES.NUMBER_INPUT,
        1,
        1,
    );
    const waitFullLoadDiv = createWaitFullLoadFilterControl(
        waitFullLoad,
        STYLES.CONTROL,
        STYLES.CHECKBOX_INPUT,
    );
    const separatorDiv = createSeparator(
        STYLES.CONTROL,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled,
        STYLES.CONTROL,
        STYLES.CHECKBOX_INPUT,
    );

    filtersContainer.append(
        variationFilterDiv,
        reviewTextFilterDiv,
        minRatingDiv,
        maxRatingDiv,
        waitFullLoadDiv,
        separatorDiv,
        filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
    addScrollToFiltersButton();
}

function processReviewCards() {
    const reviewCards = getAllElements(SELECTORS.REVIEWS);
    const isFullLoadComplete = reviewCards.length >= state.totalReviewCount;
    reviewCards.forEach((reviewCard) => {
        processReviewCard(reviewCard, isFullLoadComplete);
    });

    updateVisibleReviewsCount(reviewCards);
    if (!state.isAverageRatingFinalized) updateAverageRating(isFullLoadComplete);
}

function processReviewCard(reviewCard, isFullLoadComplete) {
    if (!filterEnabled.value) {
        showElement(reviewCard);
        return;
    }

    removeHighlights(reviewCard);

    let cachedData = state.reviewCardsCache.get(reviewCard);

    if (!cachedData) {
        const productVariationWrap = getFirstElement(SELECTORS.PRODUCT_VARIATION_WRAP, reviewCard);
        const reviewTextWrap = getFirstElement(SELECTORS.REVIEW_TEXT_WRAP, reviewCard);

        if (!productVariationWrap || !reviewTextWrap) {
            hideElement(reviewCard);
            return;
        }

        const ratingWrap = getFirstElement(SELECTORS.REVIEW_RATING_WRAP, reviewCard);

        if (!ratingWrap) {
            hideElement(reviewCard);
            return;
        }

        cachedData = {
            productVariationWrap,
            productVariationText: productVariationWrap.innerText,
            reviewTextWraps: [productVariationWrap, reviewTextWrap],
            reviewText: productVariationWrap.innerText + reviewTextWrap.innerText,
            rating: getRating(ratingWrap),
        };

        state.reviewCardsCache.set(reviewCard, cachedData);
    }

    if (reviewTextFilter.value) {
        highlightSearchStringsByFilterMultiple(reviewTextFilter, cachedData.reviewTextWraps);
    }

    if (variationFilter.value) {
        highlightSearchStringsByFilter(variationFilter, cachedData.productVariationWrap);
    }

    if (waitFullLoad.value && !isFullLoadComplete) {
        hideElement(reviewCard);
        return;
    }

    const shouldHide =
        isNotMatchTextFilter(cachedData.productVariationText, variationFilter) ||
        isNotMatchTextFilter(cachedData.reviewText, reviewTextFilter) ||
        isLessThanFilter(cachedData.rating, minRatingFilter) ||
        isGreaterThanFilter(cachedData.rating, maxRatingFilter);
    updateElementDisplay(reviewCard, shouldHide);
}

function getRating(ratingWrap) {
    const ratingClass = ratingWrap.className;
    const match = ratingClass.match(/star(\d)/);
    return match ? +match[1] : 0;
}

function updateVisibleReviewsCount(reviewCards) {
    const visibleReviewsCount = [...reviewCards].filter(
        (reviewCard) => reviewCard.style.display !== 'none',
    ).length;

    state.stickyReviewsInfo.textContent =
        `${state.stickyReviewsInfoDefaultText} (${visibleReviewsCount}/${reviewCards.length})`;
}

function updateAverageRating(isFullLoadComplete) {
    const averageRatingRounded = getAverageRating(state.reviewCardsCache);

    state.stickyAverageRatingNode.nodeValue = averageRatingRounded;
    state.averageRatingWrap.textContent = averageRatingRounded;

    if (isFullLoadComplete) {
        setStoredRatingValue(state.productArticle, averageRatingRounded);
        state.isAverageRatingFinalized = true;
    }
}

function initReviewsContainerObserver() {
    if (state.reviewsContainerObserver) return;
    state.reviewsContainerObserver = new MutationObserver(debounce(processReviewCards));
    const reviewsContainer = getFirstElement(SELECTORS.REVIEWS_LIST);
    state.reviewsContainerObserver.observe(reviewsContainer, {
        childList: true,
    });
}
