import { applyStyles, hideElement, showElement } from '../common/dom/manipulation';
import { getAllElements, getElementInnerNumber, getFirstElement } from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMinRatingFilterControl,
} from '../common/filter/factories/specificControls';
import { SELECTORS } from './selectors';
import { STYLES } from './styles';
import { createFilterFactory } from '../common/filter/factories/createFilter';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { isLessThanFilter } from '../common/filter/compare';

const { createGlobalFilter } = createFilterFactory(processComments);

const minRatingFilter = createGlobalFilter('min-rating-filter', 4);
const filterEnabled = createGlobalFilter('filter-enabled', true);

initProcessComments();

function initProcessComments() {
    const commentsTree = getFirstElement(SELECTORS.COMMENTS_TREE);

    const observer = new MutationObserver(() => executeProcessComments());
    observer.observe(commentsTree, {
        childList: true,
        subtree: true,
    });
}

function executeProcessComments() {
    const commentsHeader = getFirstElement(SELECTORS.COMMENTS_HEADER);
    appendFilterControlsIfNeeded(commentsHeader, appendFiltersContainer);
    processComments();
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);

    const minRatingDiv = createMinRatingFilterControl(
        minRatingFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT, 1, 0,
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
        showElement(comment);
        return;
    }

    const ratingWrap = getFirstElement(SELECTORS.RATING_WRAP, comment);
    if (!ratingWrap) return;

    const rating = getElementInnerNumber(ratingWrap);

    const shouldHide = isLessThanFilter(rating, minRatingFilter);

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
