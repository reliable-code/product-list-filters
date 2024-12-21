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
import { addInputSpinnerButtons } from '../common';

const { createGlobalFilter } = createFilterFactory(processReviewCards);

const textFilter = createGlobalFilter('reviews-text-filter');
const minLikesFilter = createGlobalFilter('reviews-min-likes-filter');
const maxDislikesFilter = createGlobalFilter('reviews-max-dislikes-filter');
const filterEnabled = createGlobalFilter('reviews-filter-enabled', true);

export async function initReviewsMods() {
    const comments = getFirstElement(SELECTORS.COMMENTS);
    if (comments) comments.scrollIntoView();

    const controlsContainer = await waitForElement(document, SELECTORS.CONTROLS_CONTAINER);
    appendFilterControlsIfNeeded(controlsContainer, appendFiltersContainer);

    processReviewCards();

    const observer = new MutationObserver(debounce(processReviewCards));
    const reviewsList = getFirstElement(SELECTORS.REVIEWS_LIST);
    observer.observe(reviewsList, {
        childList: true,
        subtree: true,
    });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    addInputSpinnerButtons();

    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);
    applyStyles(parentNode, {
        display: 'grid',
        gap: '10px',
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
}

function processReviewCards() {
    const reviewsCards = getAllElements(SELECTORS.REVIEWS);

    reviewsCards.forEach(processReviewCard);
}

function processReviewCard(reviewCard) {
    readMoreClick(reviewCard);

    if (!filterEnabled.value) {
        showElement(reviewCard);
        return;
    }

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

    const shouldHide =
        isNotMatchTextFilter(reviewText, textFilter) ||
        isLessThanFilter(likesNumber, minLikesFilter) ||
        isGreaterThanFilter(dislikesNumber, maxDislikesFilter);
    updateElementDisplay(reviewCard, shouldHide);
}

function readMoreClick(reviewCard) {
    if (reviewCard.hasAttribute(ATTRIBUTES.READ_MORE_CLICK_PASSED)) return;

    const readMoreSpan = findElementByText(reviewCard, 'span', 'Читать полностью');
    if (readMoreSpan) readMoreSpan.click();

    reviewCard.setAttribute(ATTRIBUTES.READ_MORE_CLICK_PASSED, '');
}
