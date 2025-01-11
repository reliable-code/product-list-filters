import {
    appendDoctorPageAdditionalLinks,
    appendReviewsInfoBlockToHeader,
    createReviewsInfoBlock,
    getDoctorIdFromPathname,
} from '../common';
import { SELECTORS } from './selectors';
import {
    applyStyles,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../../../common/dom/helpers';
import { waitForElement } from '../../../common/dom/utils';
import { getURLQueryStringParam } from '../../../common/url';
import { setStoredReviewsData } from '../../db';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import { STYLES } from '../common/styles';
import {
    createEnabledFilterControl,
    createSearchFilterControl,
} from '../../../common/filter/factories/specificControls';
import { hideElement, showElement, updateElementDisplay } from '../../../common/dom/manipulation';
import { removeHighlights } from '../../../common/dom/highlighting';
import { highlightSearchStringsByFilter } from '../../../common/filter/highlighting';
import { isNotMatchTextFilter } from '../../../common/filter/compare';

const { createGlobalFilter } = createFilterFactory(processReviewCards);

const reviewTextFilter = createGlobalFilter('reviews-text-filter');
const filterEnabled = createGlobalFilter('reviews-filter-enabled', true);

const state = {
    reviewCardsCache: new Map(),
};

export async function initReviewsMods() {
    appendDoctorPageAdditionalLinks();

    const controlsContainer = await waitForElement(document, SELECTORS.CONTROLS_CONTAINER);
    appendFilterControlsIfNeeded(controlsContainer, appendFiltersContainer);

    processReviewCards();

    const reviewsData = await getReviewsData();

    setStoredReviewsData(getDoctorIdFromPathname(), reviewsData);

    const reviewsInfoBlock = createReviewsInfoBlock(reviewsData, getBaseReviewsUrl());
    appendReviewsInfoBlockToHeader(reviewsInfoBlock);

    if (getURLQueryStringParam('rates_category')) scrollToReviews();
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);
    filtersContainer.style.marginTop = '12px';

    const reviewTextFilterDiv = createSearchFilterControl(
        reviewTextFilter,
        STYLES.CONTROL,
        STYLES.TEXT_INPUT,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled,
        STYLES.CONTROL,
        STYLES.CHECKBOX_INPUT,
    );

    filtersContainer.append(
        reviewTextFilterDiv,
        filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
}

function processReviewCards() {
    const reviewCards = getAllElements(SELECTORS.REVIEWS);
    reviewCards.forEach(processReviewCard);
}

function processReviewCard(reviewCard) {
    if (!filterEnabled.value) {
        showElement(reviewCard);
        return;
    }

    removeHighlights(reviewCard);

    let cachedData = state.reviewCardsCache.get(reviewCard);

    if (!cachedData) {
        const reviewTextWrap = getFirstElement(SELECTORS.REVIEW_TEXT_WRAP, reviewCard);

        if (!reviewTextWrap) {
            hideElement(reviewCard);
            return;
        }

        cachedData = {
            reviewTextWrap,
            reviewText: reviewTextWrap.innerText,
        };

        state.reviewCardsCache.set(reviewCard, cachedData);
    }

    if (reviewTextFilter.value) {
        highlightSearchStringsByFilter(reviewTextFilter, cachedData.reviewTextWrap);
    }

    const shouldHide =
        isNotMatchTextFilter(cachedData.reviewText, reviewTextFilter);
    updateElementDisplay(reviewCard, shouldHide);
}

async function getReviewsData() {
    const filterChip = getFirstElement(SELECTORS.FILTER_CHIP);
    filterChip.click();

    const filterList = await waitForElement(document, SELECTORS.FILTER_LIST);
    const reviewsData = [...getAllElements(SELECTORS.FILTER_LIST_ITEM, filterList)]
        .map((filter) => {
            const categoryAttributeValue = filter.getAttribute('data-qa');
            if (!categoryAttributeValue) return null;
            const category = categoryAttributeValue.replace('reviews_filter_list_item_', '');

            const title = getFirstElement(SELECTORS.FILTER_TITLE_WRAP, filter)
                .textContent
                .trim();

            const countWrap = getFirstElement(SELECTORS.FILTER_COUNT_WRAP, filter);
            const count = getElementInnerNumber(countWrap, true);
            const bgClassSuffix = parseBgClassSuffix(countWrap.classList);

            return {
                category,
                title,
                count,
                bgClassSuffix,
            };
        });

    filterChip.click();

    return reviewsData;
}

function parseBgClassSuffix(classList) {
    const match = classList.value.match(/ui-kit-bg-bg-(\w+)/);
    return match ? match[1] : null;
}

function getBaseReviewsUrl() {
    const { location } = window;
    return `${location.origin}${location.pathname}`;
}

function scrollToReviews() {
    const reviewsContainer = getFirstElement(SELECTORS.REVIEWS_CONTAINER);
    reviewsContainer.scrollIntoView({ behavior: 'smooth' });
}
