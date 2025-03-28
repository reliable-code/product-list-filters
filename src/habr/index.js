import { applyStyles, hideElement, showElement } from '../common/dom/manipulation';
import { getAllElements, getFirstElement } from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMinLikesFilterControl,
} from '../common/filter/factories/specificControls';
import { SELECTORS } from './selectors';
import { STYLES } from './styles';
import { createFilterFactory } from '../common/filter/factories/createFilter';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { isLessThanFilter } from '../common/filter/compare';
import { waitForElement } from '../common/dom/utils';

const { createGlobalFilter } = createFilterFactory(processComments);

const minRatingFilter = createGlobalFilter('min-rating-filter', 4);
const filterEnabled = createGlobalFilter('filter-enabled', true);

const state = {
    commentsCache: new WeakMap(),
};

await initProcessComments();

async function initProcessComments() {
    const commentsTree = await waitForElement(document, SELECTORS.COMMENTS_TREE);

    const observer = new MutationObserver(executeProcessComments);
    observer.observe(commentsTree, {
        childList: true,
        subtree: true,
    });
}

async function executeProcessComments() {
    const commentsHeader = await waitForElement(document, SELECTORS.COMMENTS_HEADER);
    appendFilterControlsIfNeeded(commentsHeader, appendFiltersContainer);
    processComments();
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);

    const minRatingDiv = createMinLikesFilterControl(
        minRatingFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );

    filtersContainer.append(minRatingDiv, filterEnabledDiv);

    parentNode.append(filtersContainer);
}

function processComments() {
    const comments = getAllElements(SELECTORS.COMMENTS);
    comments.forEach(processComment);
}

function processComment(comment) {
    if (!filterEnabled.value) {
        showElementWithParents(comment);
        return;
    }

    let cachedData = state.commentsCache.get(comment);

    if (!cachedData) {
        const ratingWrap = getFirstElement(SELECTORS.RATING_WRAP, comment);
        if (!ratingWrap) return;

        const ratingText = ratingWrap.innerText.trim();
        if (ratingText === '') return;
        const rating = +ratingText;

        cachedData = {
            rating,
        };

        state.commentsCache.set(comment, cachedData);
    }

    const shouldHide = isLessThanFilter(cachedData.rating, minRatingFilter);

    if (shouldHide) {
        hideElementWithParents(comment);
    } else {
        showElementWithParents(comment);
    }
}

function hideElementWithParents(element) {
    hideElement(element);

    const parent = element.parentElement;
    if (parent && [...parent.children].every((child) => child.style.display === 'none')) {
        hideElementWithParents(parent);
    }
}

function showElementWithParents(element) {
    showElement(element);

    const parent = element.parentElement;
    if (parent && parent.style.display === 'none') {
        showElementWithParents(parent);
    }
}
