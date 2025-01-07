import { debounce, waitForElement } from '../../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import { applyStyles, getAllElements, getFirstElement } from '../../../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMaxRatingFilterControl,
    createMinRatingFilterControl,
    createSearchFilterControl,
} from '../../../common/filter/factories/specificControls';
import { STYLES } from '../common/styles';
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
import { highlightSearchStringsByFilterMultiple } from '../../../common/filter/highlighting';

const { createGlobalFilter } = createFilterFactory(processReviewCards);

const reviewTextFilter = createGlobalFilter('reviews-text-filter');
const minRatingFilter = createGlobalFilter('reviews-min-rating-filter');
const maxRatingFilter = createGlobalFilter('reviews-max-rating-filter');
const filterEnabled = createGlobalFilter('reviews-filter-enabled', true);

const reviewCardsCache = new WeakMap();

export async function initReviewsMods() {
    resetFiltersIfNotLastProduct();

    const controlsContainer = await waitForElement(document, SELECTORS.CONTROLS_CONTAINER);
    appendFilterControlsIfNeeded(controlsContainer, appendFiltersContainer);

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
        reviewTextFilter.resetValue();
        minRatingFilter.resetValue();
        maxRatingFilter.resetValue();
    }

    setReviewsLastProductArticle(productArticle);
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.REVIEWS_FILTERS_CONTAINER);
    filtersContainer.classList.add('input-search');

    const reviewTextFilterDiv = createSearchFilterControl(
        reviewTextFilter, STYLES.CONTROL, STYLES.TEXT_INPUT,
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
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );

    filtersContainer.append(
        reviewTextFilterDiv,
        minRatingDiv,
        maxRatingDiv,
        filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
    addScrollToFiltersButton();
}

function processReviewCards() {
    const reviewCards = getAllElements(SELECTORS.REVIEWS);
    reviewCards.forEach(processReviewCard);

    updateVisibleReviewsCount(reviewCards);
}

function processReviewCard(reviewCard) {
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

        const textWraps = [productVariationWrap, reviewTextWrap];

        const ratingWrap = getFirstElement(SELECTORS.REVIEW_RATING_WRAP, reviewCard);

        if (!ratingWrap) {
            hideElement(reviewCard);
            return;
        }

        cachedData = {
            textWraps,
            filterableText: reviewTextWrap.innerText + productVariationWrap.innerText,
            rating: getRating(ratingWrap),
        };

        reviewCardsCache.set(reviewCard, cachedData);
    }

    if (reviewTextFilter.value) {
        highlightSearchStringsByFilterMultiple(reviewTextFilter, cachedData.textWraps);
    }

    const shouldHide =
        isNotMatchTextFilter(cachedData.filterableText, reviewTextFilter) ||
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
