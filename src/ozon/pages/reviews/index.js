import { debounce, waitForElement } from '../../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import {
    findElementByText,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    hasElement,
} from '../../../common/dom/helpers';
import {
    createEnabledFilterControl,
    createHasPhotoFilterControl,
    createLikesFilterControl,
    createMaxRatingFilterControl,
    createMinRatingFilterControl,
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
    isNotEqualBoolFilter,
    isNotMatchTextFilter,
} from '../../../common/filter/compare';
import { ATTRIBUTES } from './attributes';
import {
    addInputSpinnerButtons,
    addScrollToFiltersButton,
    getProductArticleFromPathname,
} from '../common';
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
} from '../../../common/db/specific';

const { createGlobalFilter } = createFilterFactory(processReviewCards);

const variationFilter = createGlobalFilter('reviews-variation-filter');
const reviewTextFilter = createGlobalFilter('reviews-text-filter');
const minLikesFilter = createGlobalFilter('reviews-min-likes-filter');
const maxDislikesFilter = createGlobalFilter('reviews-max-dislikes-filter');
const minRatingFilter = createGlobalFilter('reviews-min-rating-filter');
const maxRatingFilter = createGlobalFilter('reviews-max-rating-filter');
const hasPhotoFilter = createGlobalFilter('reviews-has-photo-filter', false);
const filterEnabled = createGlobalFilter('reviews-filter-enabled', true);

const state = {
    reviewsContainer: null,
    stickyReviewsInfo: null,
    stickyReviewsInfoDefaultText: null,
    reviewCardsCache: new Map(),
};

export async function initReviewsMods(needScrollToComments = true, isProductPage = false) {
    if (needScrollToComments) scrollToComments(isProductPage);

    resetFiltersIfNotLastProduct();

    await executeReviewsMods(isProductPage);

    if (isProductPage) await observePaginator();
}

export function scrollToComments(isProductPage) {
    const comments = getFirstElement(SELECTORS.COMMENTS);
    if (!comments) return;

    const commentsPosition = comments.getBoundingClientRect().top + window.scrollY;
    const offset = isProductPage ? 80 : 0;
    window.scrollTo({
        top: commentsPosition - offset,
    });
}

function resetFiltersIfNotLastProduct() {
    const productArticle = getProductArticleFromPathname();
    const lastProductArticle = getReviewsLastProductArticle();

    if (productArticle !== lastProductArticle) {
        variationFilter.resetValue();
        reviewTextFilter.resetValue();
        minLikesFilter.resetValue();
        maxDislikesFilter.resetValue();
        minRatingFilter.resetValue();
        maxRatingFilter.resetValue();
        hasPhotoFilter.resetValue();
    }

    setReviewsLastProductArticle(productArticle);
}

async function executeReviewsMods(isProductPage) {
    const controlsContainer = await waitForElement(document, SELECTORS.CONTROLS_CONTAINER);

    await initVariables(isProductPage);
    appendFilterControlsIfNeeded(controlsContainer, appendFiltersContainer);

    processReviewCards();

    const observer = new MutationObserver(debounce(processReviewCards));
    observer.observe(state.reviewsContainer, {
        childList: true,
    });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    addInputSpinnerButtons();
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);
    applyStyles(parentNode, STYLES.FILTERS_CONTAINER_WRAP);

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
    const minLikesDiv = createLikesFilterControl(
        'Мин. лайков: ',
        minLikesFilter,
        STYLES.CONTROL,
        STYLES.NUMBER_INPUT,
    );
    const maxDislikesDiv = createLikesFilterControl(
        'Макс. дизлайков: ',
        maxDislikesFilter,
        STYLES.CONTROL,
        STYLES.NUMBER_INPUT,
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
    const hasPhotoDiv = createHasPhotoFilterControl(
        hasPhotoFilter, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );
    const separatorDiv = createSeparator(
        STYLES.CONTROL,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );

    filtersContainer.append(
        variationFilterDiv,
        reviewTextFilterDiv,
        minLikesDiv,
        maxDislikesDiv,
        minRatingDiv,
        maxRatingDiv,
        hasPhotoDiv,
        separatorDiv,
        filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
    addScrollToFiltersButton();
}

async function initVariables(isProductPage) {
    if (state.reviewsContainer) return;

    const reviewsList = getFirstElement(SELECTORS.REVIEWS_LIST);
    state.reviewsContainer = isProductPage ? reviewsList?.parentNode : reviewsList.children[1];

    state.stickyReviewsInfo = getFirstElement(SELECTORS.STICKY_REVIEWS_INFO);
    state.stickyReviewsInfoDefaultText = state.stickyReviewsInfo.textContent.trim();
}

function processReviewCards() {
    const reviews = getAllElements(SELECTORS.REVIEWS);
    const reviewCards = [...reviews].map((review) => review.parentNode);
    reviewCards.forEach(processReviewCard);

    const visibleReviews = getVisibleReviews(reviews);
    updateVisibleReviewsCount(visibleReviews, reviews);

    removeUnnecessaryElements();
}

function processReviewCard(reviewCard) {
    if (!filterEnabled.value) {
        showElement(reviewCard);
        return;
    }

    removeHighlights(reviewCard);

    let cachedData = state.reviewCardsCache.get(reviewCard);

    if (!cachedData) {
        readMoreClick(reviewCard);

        const reviewHeader = getFirstElement(SELECTORS.REVIEW_HEADER, reviewCard);
        const reviewContent = getFirstElement(SELECTORS.REVIEW_CONTENT, reviewCard);
        const reviewFooter = getFirstElement(SELECTORS.REVIEW_FOOTER, reviewCard);

        if (!reviewHeader || !reviewContent || !reviewFooter) {
            hideElement(reviewCard);
            return;
        }

        const productVariationWrap = getFirstElement(
            SELECTORS.PRODUCT_VARIATION_WRAP, reviewContent,
        );
        const reviewSurveyWrap = getFirstElement(SELECTORS.REVIEW_SURVEY_WRAP, reviewContent);
        const reviewTextWrap = getFirstElement(SELECTORS.REVIEW_TEXT_WRAP, reviewContent);
        const reviewTextWraps = [reviewSurveyWrap, reviewTextWrap].filter(Boolean);

        const likeButton = findElementByText(reviewFooter, 'button', 'Да');
        const dislikeButton = findElementByText(reviewFooter, 'button', 'Нет');

        if (!likeButton || !dislikeButton) {
            hideElement(reviewCard);
            return;
        }

        const productVariationText = productVariationWrap?.innerText || '';
        const reviewText = reviewTextWraps.map((textWrap) => textWrap.innerText)
            .join(' ');

        const likesNumber = getElementInnerNumber(likeButton, true);
        const dislikesNumber = getElementInnerNumber(dislikeButton, true);

        const rating = getRating(reviewHeader);

        const hasPhoto = hasElement('img', reviewContent);

        cachedData = {
            productVariationWrap,
            productVariationText,
            reviewTextWraps,
            reviewText,
            likesNumber,
            dislikesNumber,
            rating,
            hasPhoto,
        };

        state.reviewCardsCache.set(reviewCard, cachedData);
    }

    if (variationFilter.value && cachedData.productVariationWrap) {
        highlightSearchStringsByFilter(variationFilter, cachedData.productVariationWrap);
    }

    if (reviewTextFilter.value) {
        highlightSearchStringsByFilterMultiple(reviewTextFilter, cachedData.reviewTextWraps);
    }

    const shouldHide =
        isNotMatchTextFilter(cachedData.productVariationText, variationFilter) ||
        isNotMatchTextFilter(cachedData.reviewText, reviewTextFilter) ||
        isLessThanFilter(cachedData.likesNumber, minLikesFilter) ||
        isGreaterThanFilter(cachedData.dislikesNumber, maxDislikesFilter) ||
        isLessThanFilter(cachedData.rating, minRatingFilter) ||
        isGreaterThanFilter(cachedData.rating, maxRatingFilter) ||
        isNotEqualBoolFilter(cachedData.hasPhoto, hasPhotoFilter);
    updateElementDisplay(reviewCard, shouldHide);
}

function getRating(reviewHeader) {
    return getAllElements('svg[style*="255, 168, 0"]', reviewHeader).length;
}

function readMoreClick(reviewCard) {
    if (reviewCard.hasAttribute(ATTRIBUTES.READ_MORE_CLICK_PASSED)) return;

    const readMoreSpan = findElementByText(reviewCard, 'span', 'Читать полностью');
    if (readMoreSpan) readMoreSpan.click();

    reviewCard.setAttribute(ATTRIBUTES.READ_MORE_CLICK_PASSED, '');
}

function getVisibleReviews(reviews) {
    return [...reviews].filter(
        (review) => review.parentNode.style.display !== 'none',
    );
}

function updateVisibleReviewsCount(visibleReviews, reviews) {
    state.stickyReviewsInfo.textContent =
        `${state.stickyReviewsInfoDefaultText} (${(visibleReviews.length)}/${reviews.length})`;
}

function removeUnnecessaryElements() {
    getAllElements(SELECTORS.UNNECESSARY_ELEMENTS, state.reviewsContainer)
        .forEach((element) => element.remove());
}

async function observePaginator() {
    const paginator = getFirstElement(SELECTORS.PAGINATOR);
    const observer = new MutationObserver(
        debounce(() => checkFiltersContainer(paginator)),
    );
    observer.observe(paginator, {
        childList: true,
    });
}

async function checkFiltersContainer(paginator) {
    if (getFirstElement(SELECTORS.FILTERS_CONTAINER, paginator)) return;

    await waitForElement(paginator, SELECTORS.WEB_REVIEW_TABS);

    await executeReviewsMods(true);
}
