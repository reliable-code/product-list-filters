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
const hasPhotoFilter = createGlobalFilter('reviews-has-photo-filter', false);
const filterEnabled = createGlobalFilter('reviews-filter-enabled', true);

let reviewsContainer;

const reviewCardsCache = new WeakMap();

export async function initReviewsMods(needScrollToComments = true, isMultipleReviewsList = false) {
    if (needScrollToComments) scrollToComments(isMultipleReviewsList);

    resetFiltersIfNotLastProduct();

    await executeReviewsMods(isMultipleReviewsList);

    if (isMultipleReviewsList) await observePaginator();
}

function scrollToComments(isMultipleReviewsList) {
    const comments = getFirstElement(SELECTORS.COMMENTS);
    if (!comments) return;

    const commentsPosition = comments.getBoundingClientRect().top + window.scrollY;
    const offset = isMultipleReviewsList ? 80 : 0;
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
        hasPhotoFilter.resetValue();
        maxDislikesFilter.resetValue();
    }

    setReviewsLastProductArticle(productArticle);
}

async function executeReviewsMods(isMultipleReviewsList) {
    const controlsContainer = await waitForElement(document, SELECTORS.CONTROLS_CONTAINER);
    appendFilterControlsIfNeeded(controlsContainer, appendFiltersContainer);
    setReviewsContainer(isMultipleReviewsList);

    processReviewCards();

    const observer = new MutationObserver(debounce(processReviewCards));
    observer.observe(reviewsContainer, {
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
        hasPhotoDiv,
        separatorDiv,
        filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
    addScrollToFiltersButton();
}

function setReviewsContainer(isMultipleReviewsList) {
    const reviewsList = getFirstElement(SELECTORS.REVIEWS_LIST);
    reviewsContainer = isMultipleReviewsList ? reviewsList?.parentNode : reviewsList.children[1];
}

function processReviewCards() {
    const reviews = getAllElements(SELECTORS.REVIEWS);
    reviews.forEach(processReviewCard);

    updateVisibleReviewsCount(reviews);

    removeUnnecessaryElements();
}

function processReviewCard(review) {
    const reviewCard = review.parentNode;

    if (!filterEnabled.value) {
        showElement(reviewCard);
        return;
    }

    removeHighlights(reviewCard);

    let cachedData = reviewCardsCache.get(reviewCard);

    if (!cachedData) {
        readMoreClick(reviewCard);

        const reviewContent = getFirstElement(SELECTORS.REVIEW_CONTENT, reviewCard);
        const reviewFooter = getFirstElement(SELECTORS.REVIEW_FOOTER, reviewCard);

        if (!reviewContent || !reviewFooter) {
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

        const hasPhoto = hasElement('img', reviewContent);

        cachedData = {
            productVariationWrap,
            productVariationText,
            reviewTextWraps,
            reviewText,
            likesNumber,
            dislikesNumber,
            hasPhoto,
        };

        reviewCardsCache.set(reviewCard, cachedData);
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
        isNotEqualBoolFilter(cachedData.hasPhoto, hasPhotoFilter);
    updateElementDisplay(reviewCard, shouldHide);
}

function readMoreClick(reviewCard) {
    if (reviewCard.hasAttribute(ATTRIBUTES.READ_MORE_CLICK_PASSED)) return;

    const readMoreSpan = findElementByText(reviewCard, 'span', 'Читать полностью');
    if (readMoreSpan) readMoreSpan.click();

    reviewCard.setAttribute(ATTRIBUTES.READ_MORE_CLICK_PASSED, '');
}

function updateVisibleReviewsCount(reviews) {
    const visibleReviewsCount = [...reviews].filter(
        (review) => review.parentNode.style.display !== 'none',
    ).length;

    const stickyReviewsInfo = getFirstElement(SELECTORS.STICKY_REVIEWS_INFO);
    if (!stickyReviewsInfo) return;

    const baseReviewsInfoText = stickyReviewsInfo.textContent.split('(')[0].trim();
    stickyReviewsInfo.textContent = `${baseReviewsInfoText} (${visibleReviewsCount}/${reviews.length})`;
}

function removeUnnecessaryElements() {
    getAllElements(SELECTORS.UNNECESSARY_ELEMENTS, reviewsContainer)
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
