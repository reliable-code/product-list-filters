import { createIcons, Download } from 'lucide';
import { debounce, waitForElement } from '../../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import {
    findElementByText,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    getNormalizedSpacingText,
    hasElement,
} from '../../../common/dom/helpers';
import {
    createEnabledFilterControl,
    createHasPhotoFilterControl,
    createLikesFilterControl,
    createMaxRatingFilterControl,
    createMinLikesFilterControl,
    createMinRatingFilterControl,
    createWaitFullLoadFilterControl,
} from '../../../common/filter/factories/specificControls';
import { STYLES } from './styles';
import { SELECTORS } from './selectors';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';
import {
    applyStyles,
    hideElement,
    saveToFile,
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
import { getAverageRating } from '../../../common/rating/helpers';

import { createActionLinkWithIconControl } from '../../../common/dom/factories/controls';

const { createGlobalFilter } = createFilterFactory(processReviewCards);

const variationFilter = createGlobalFilter('reviews-variation-filter');
const reviewTextFilter = createGlobalFilter('reviews-text-filter');
const minLikesFilter = createGlobalFilter('reviews-min-likes-filter');
const maxDislikesFilter = createGlobalFilter('reviews-max-dislikes-filter');
const minRatingFilter = createGlobalFilter('reviews-min-rating-filter');
const maxRatingFilter = createGlobalFilter('reviews-max-rating-filter');
const hasPhotoFilter = createGlobalFilter('reviews-has-photo-filter', false);
const waitFullLoad = createGlobalFilter('reviews-wait-full-load', false);
const filterEnabled = createGlobalFilter('reviews-filter-enabled', true);

const state = {
    isProductPage: false,
    productArticle: null,
    reviewsContainer: null,
    stickyReviewsInfo: null,
    stickyReviewsInfoDefaultText: null,
    totalReviewCount: null,
    isFullLoadComplete: false,
    reviewCardsCache: new Map(),
};

export async function initReviewsMods(needScrollToComments = true, isProductPage = false) {
    state.isProductPage = isProductPage;
    state.productArticle = getProductArticleFromPathname();

    if (needScrollToComments) await initScrollToComments();

    resetFiltersIfNotLastProduct();

    await executeReviewsMods();

    if (state.isProductPage) await observePaginator();
}

async function initScrollToComments() {
    const comments = await waitForElement(document, SELECTORS.COMMENTS);

    if (!state.isProductPage) {
        scrollToComments(comments, 70);
        return;
    }

    const scrollToCommentsWhileNoReviewsList = () => {
        scrollToComments(comments);

        const reviewsList = getFirstElement(SELECTORS.REVIEWS_LIST);
        if (reviewsList) return;

        requestAnimationFrame(scrollToCommentsWhileNoReviewsList);
    };

    scrollToCommentsWhileNoReviewsList();
}

function scrollToComments(comments, offset = 80) {
    window.scrollTo({
        top: comments.getBoundingClientRect().top + window.scrollY - offset,
    });
}

function resetFiltersIfNotLastProduct() {
    const { productArticle } = state;
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

async function executeReviewsMods() {
    const controlsContainer = await waitForElement(document, SELECTORS.CONTROLS_CONTAINER);

    await initVariables();
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
    const minLikesDiv = createMinLikesFilterControl(
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
    const waitFullLoadDiv = createWaitFullLoadFilterControl(
        waitFullLoad,
        STYLES.CONTROL,
        STYLES.CHECKBOX_INPUT,
    );
    const separatorDiv = createSeparator(
        STYLES.CONTROL,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );

    const downloadDiv = createActionLinkWithIconControl(
        saveVisibleReviewsData, 'Скачать', 'download', STYLES.CONTROL,
    );

    filtersContainer.append(
        variationFilterDiv,
        reviewTextFilterDiv,
        minLikesDiv,
        maxDislikesDiv,
        minRatingDiv,
        maxRatingDiv,
        hasPhotoDiv,
        waitFullLoadDiv,
        separatorDiv,
        filterEnabledDiv,
        downloadDiv,
    );

    parentNode.append(filtersContainer);
    createIcons({ icons: { Download } });
    addScrollToFiltersButton();
}

function saveVisibleReviewsData() {
    saveToFile(
        getSelectedVisibleReviewsDataAsJson(),
        `reviews_${state.productArticle || Date.now()}.txt`,
    );
}

function getSelectedVisibleReviewsDataAsJson() {
    return JSON.stringify(getSelectedVisibleReviewsData());
}

function getSelectedVisibleReviewsData() {
    const fields = ['author', 'productVariationText', 'rating', 'reviewText', 'likes', 'dislikes'];
    return [...state.reviewCardsCache]
        .filter(([reviewCard, data]) => reviewCard.style.display !== 'none' && data.reviewText)
        .map(([, data]) => Object.fromEntries(fields.map((key) => [key, data[key]])));
}

async function initVariables() {
    if (state.reviewsContainer) return;

    const reviewsList = await waitForElement(document, SELECTORS.REVIEWS_LIST);
    if (!state.isProductPage) {
        state.reviewsContainer = reviewsList.children[1];
        return;
    }

    state.reviewsContainer = reviewsList?.parentNode;
    state.stickyReviewsInfo = await waitForElement(document, SELECTORS.STICKY_REVIEWS_INFO);
    state.stickyReviewsInfoDefaultText = state.stickyReviewsInfo.textContent.trim();
    state.totalReviewCount = getElementInnerNumber(state.stickyReviewsInfo, true);
}

function processReviewCards() {
    const reviews = getAllElements(SELECTORS.REVIEWS);
    const reviewCards = [...reviews].map((review) => review.parentNode);
    state.isFullLoadComplete = !state.isProductPage || reviewCards.length >= state.totalReviewCount;
    reviewCards.forEach(processReviewCard);

    if (state.isProductPage) updateVisibleReviewCardsInfo(reviewCards);

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

        if (!reviewHeader || !reviewContent) {
            hideElement(reviewCard);
            return;
        }

        const productVariationWrap = getFirstElement(
            SELECTORS.PRODUCT_VARIATION_WRAP, reviewContent,
        );
        const reviewSurveyWrap = getFirstElement(SELECTORS.REVIEW_SURVEY_WRAP, reviewContent);
        const reviewTextWrap = getFirstElement(SELECTORS.REVIEW_TEXT_WRAP, reviewContent);
        const reviewTextWraps = [reviewSurveyWrap, reviewTextWrap].filter(Boolean);

        const likeButton = reviewFooter && findElementByText(reviewFooter, 'button', 'Да');
        const dislikeButton = reviewFooter && findElementByText(reviewFooter, 'button', 'Нет');

        const productVariationText = productVariationWrap?.innerText || '';
        const reviewText = reviewTextWraps.map(getNormalizedSpacingText)
            .join(' ');

        const likes = getElementInnerNumber(likeButton, true, false, 0);
        const dislikes = getElementInnerNumber(dislikeButton, true, false, 0);

        const rating = getRating(reviewHeader);

        const hasPhoto = hasElement('img', reviewContent);

        const authorWrap = getFirstElement(SELECTORS.AUTHOR_WRAP, reviewHeader);
        const authorText = authorWrap?.innerText;
        const author = authorText !== 'Пользователь предпочёл скрыть свои данные'
            ? authorText
            : null;

        cachedData = {
            productVariationWrap,
            productVariationText,
            reviewTextWraps,
            reviewText,
            likes,
            dislikes,
            rating,
            hasPhoto,
            author,
        };

        state.reviewCardsCache.set(reviewCard, cachedData);
    }

    if (variationFilter.value && cachedData.productVariationWrap) {
        highlightSearchStringsByFilter(variationFilter, cachedData.productVariationWrap);
    }

    if (reviewTextFilter.value) {
        highlightSearchStringsByFilterMultiple(reviewTextFilter, cachedData.reviewTextWraps);
    }

    if (waitFullLoad.value && !state.isFullLoadComplete) {
        hideElement(reviewCard);
        return;
    }

    const shouldHide =
        isNotMatchTextFilter(cachedData.productVariationText, variationFilter) ||
        isNotMatchTextFilter(cachedData.reviewText, reviewTextFilter) ||
        isLessThanFilter(cachedData.likes, minLikesFilter) ||
        isGreaterThanFilter(cachedData.dislikes, maxDislikesFilter) ||
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

function updateVisibleReviewCardsInfo(reviewCards) {
    const visibleReviewCards = getVisibleReviewCards(reviewCards);

    const filteredReviewCardsCache = visibleReviewCards
        .filter((reviewCard) => state.reviewCardsCache.has(reviewCard))
        .map((reviewCard) => state.reviewCardsCache.get(reviewCard));

    const averageRatingRounded = getAverageRating(filteredReviewCardsCache);

    const averageRatingInfo = averageRatingRounded ? ` • ${averageRatingRounded}` : '';
    state.stickyReviewsInfo.textContent = `
        ${state.stickyReviewsInfoDefaultText} 
        (${visibleReviewCards.length}/${reviewCards.length}${averageRatingInfo})
    `;
}

function getVisibleReviewCards(reviewCards) {
    return reviewCards.filter((reviewCard) => reviewCard.style.display !== 'none');
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
