import { debounce, waitForElement } from '../../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import {
    applyStyles,
    findElementByText,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../../../common/dom/helpers';
import {
    createEnabledFilterControl,
    createLikesFilterControl,
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
import { ATTRIBUTES } from './attributes';
import {
    addInputSpinnerButtons,
    addScrollToFiltersButton,
    getProductArticleFromPathname,
} from '../common';
import { getReviewsLastProductArticle, setReviewsLastProductArticle } from '../../db/db';
import { removeHighlights } from '../../../common/dom/highlighting';
import { highlightSearchStringsByFilter } from '../../../common/filter/highlighting';

const { createGlobalFilter } = createFilterFactory(processReviewCards);

const textFilter = createGlobalFilter('reviews-text-filter');
const minLikesFilter = createGlobalFilter('reviews-min-likes-filter');
const maxDislikesFilter = createGlobalFilter('reviews-max-dislikes-filter');
const filterEnabled = createGlobalFilter('reviews-filter-enabled', true);

let reviewsContainer;

const reviewCardsCache = new WeakMap();

export async function initReviewsMods(needScrollToComments = true, isMultipleReviewsList = false) {
    if (needScrollToComments) scrollToComments();

    resetFiltersIfNotLastProduct();

    const controlsContainer = await waitForElement(document, SELECTORS.CONTROLS_CONTAINER);
    appendFilterControlsIfNeeded(controlsContainer, appendFiltersContainer);
    setReviewsContainer(isMultipleReviewsList);

    processReviewCards();

    const observer = new MutationObserver(debounce(processReviewCards));
    observer.observe(reviewsContainer, {
        childList: true,
    });
}

function scrollToComments() {
    const comments = getFirstElement(SELECTORS.COMMENTS);
    if (comments) comments.scrollIntoView();
}

function resetFiltersIfNotLastProduct() {
    const productArticle = getProductArticleFromPathname();
    const lastProductArticle = getReviewsLastProductArticle();

    if (productArticle !== lastProductArticle) {
        textFilter.resetValue();
        minLikesFilter.resetValue();
        hasPhotoFilter.resetValue();
        maxDislikesFilter.resetValue();
    }

    setReviewsLastProductArticle(productArticle);
}

function appendFiltersContainer(filtersContainer, parentNode) {
    addInputSpinnerButtons();
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);
    applyStyles(parentNode, {
        display: 'grid',
        gap: '10px',
        paddingBottom: '0',
    });

    const nameFilterDiv = createSearchFilterControl(
        textFilter, STYLES.CONTROL, STYLES.TEXT_INPUT,
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
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );

    filtersContainer.append(
        nameFilterDiv,
        minLikesDiv,
        maxDislikesDiv,
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

        const reviewTextWrap = getFirstElement(SELECTORS.REVIEW_TEXT_WRAP, reviewCard);
        const reviewFooter = getFirstElement(SELECTORS.REVIEW_FOOTER, reviewCard);

        if (!reviewTextWrap || !reviewFooter) {
            hideElement(reviewCard);
            return;
        }

        const likeButton = findElementByText(reviewFooter, 'button', 'Да');
        const dislikeButton = findElementByText(reviewFooter, 'button', 'Нет');

        if (!likeButton || !dislikeButton) {
            hideElement(reviewCard);
            return;
        }

        const likesNumber = getElementInnerNumber(likeButton, true);
        const dislikesNumber = getElementInnerNumber(dislikeButton, true);

        const reviewText = reviewTextWrap.innerText;

        cachedData = {
            reviewTextWrap,
            reviewText,
            likesNumber,
            dislikesNumber,
        };

        reviewCardsCache.set(reviewCard, cachedData);
    }

    if (textFilter.value) {
        highlightSearchStringsByFilter(textFilter, cachedData.reviewTextWrap);
    }

    const shouldHide =
        isNotMatchTextFilter(cachedData.reviewText, textFilter) ||
        isLessThanFilter(cachedData.likesNumber, minLikesFilter) ||
        isGreaterThanFilter(cachedData.dislikesNumber, maxDislikesFilter);
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
