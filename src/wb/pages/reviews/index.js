import { debounce, waitForElement } from '../../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import {
    applyStyles,
    getAllElements,
    getFirstElement,
    getFirstElementInnerNumber,
} from '../../../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMaxRatingFilterControl,
    createMinRatingFilterControl,
} from '../../../common/filter/factories/specificControls';
import { STYLES } from './styles';
import { SELECTORS } from './selectors';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';
import { hideElement, showElement, updateElementDisplay } from '../../../common/dom/manipulation';
import {
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../../../common/filter/compare';
import { addScrollToFiltersButton, getProductArticleFromPathname } from '../common';
import { getReviewsLastProductArticle, setReviewsLastProductArticle } from '../../db/db';
import { removeHighlights } from '../../../common/dom/highlighting';
import {
    highlightSearchStringsByFilter,
    highlightSearchStringsByFilterMultiple,
} from '../../../common/filter/highlighting';
import {
    createCheckboxFilterControl,
    createTextFilterControl,
} from '../../../common/filter/factories/genericControls';
import { createSeparator } from '../../../common/filter/factories/helpers';
import { roundToPrecision } from '../../../common/mathUtils';

const { createGlobalFilter } = createFilterFactory(processReviewCards);

const variationFilter = createGlobalFilter('reviews-variation-filter');
const reviewTextFilter = createGlobalFilter('reviews-text-filter');
const minRatingFilter = createGlobalFilter('reviews-min-rating-filter');
const maxRatingFilter = createGlobalFilter('reviews-max-rating-filter');
const waitFullLoad = createGlobalFilter('reviews-wait-full-load', false);
const filterEnabled = createGlobalFilter('reviews-filter-enabled', true);

const reviewCardsCache = new Map();
let totalReviewCount;
let averageRatingWrap;
let stickyAverageRating;

export async function initReviewsMods() {
    resetFiltersIfNotLastProduct();

    const controlsContainer = await waitForElement(document, SELECTORS.CONTROLS_CONTAINER);
    appendFilterControlsIfNeeded(controlsContainer, appendFiltersContainer);

    initVariables();

    processReviewCards();

    const observer = new MutationObserver(debounce(processReviewCards));
    const reviewsContainer = getFirstElement(SELECTORS.REVIEWS_LIST);
    observer.observe(reviewsContainer, {
        childList: true,
    });
}

function resetFiltersIfNotLastProduct() {
    const productArticle = getProductArticleFromPathname();
    const lastProductArticle = getReviewsLastProductArticle();

    if (productArticle !== lastProductArticle) {
        variationFilter.resetValue();
        reviewTextFilter.resetValue();
        minRatingFilter.resetValue();
        maxRatingFilter.resetValue();
    }

    setReviewsLastProductArticle(productArticle);
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
    const waitFullLoadDiv = createCheckboxFilterControl(
        'Прогрузка: ',
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

function initVariables() {
    totalReviewCount = getFirstElementInnerNumber(document, SELECTORS.TOTAL_REVIEWS_COUNT);

    const stickyAverageRatingWrap = getFirstElement(SELECTORS.STICKY_AVERAGE_RATING_WRAP);
    averageRatingWrap = getFirstElement(SELECTORS.AVERAGE_RATING_WRAP);

    if (!stickyAverageRatingWrap || !averageRatingWrap) return;

    stickyAverageRating = getFirstTextNode(stickyAverageRatingWrap);
}

function getFirstTextNode(element) {
    return [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
}

function processReviewCards() {
    const reviewCards = getAllElements(SELECTORS.REVIEWS);
    const isFullLoadComplete = reviewCards.length >= totalReviewCount;
    reviewCards.forEach((reviewCard) => {
        processReviewCard(reviewCard, isFullLoadComplete);
    });

    updateVisibleReviewsCount(reviewCards);
    updateAverageRating();
}

function processReviewCard(reviewCard, isFullLoadComplete) {
    if (!filterEnabled.value) {
        showElement(reviewCard);
        return;
    }

    removeHighlights(reviewCard);

    let cachedData = reviewCardsCache.get(reviewCard);

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

        reviewCardsCache.set(reviewCard, cachedData);
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

    const stickyReviewsInfo = getFirstElement(SELECTORS.STICKY_REVIEWS_INFO);
    if (!stickyReviewsInfo) return;

    const baseReviewsInfoText = stickyReviewsInfo.textContent.split('(')[0].trim();
    stickyReviewsInfo.textContent = `${baseReviewsInfoText} (${visibleReviewsCount}/${reviewCards.length})`;
}

function updateAverageRating() {
    let totalRating = 0;
    let reviewCount = 0;

    reviewCardsCache.forEach((cachedData) => {
        totalRating += cachedData.rating;
        reviewCount += 1;
    });

    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
    const averageRatingRounded = roundToPrecision(averageRating);

    stickyAverageRating.nodeValue = averageRatingRounded;
    averageRatingWrap.textContent = averageRatingRounded;
}
