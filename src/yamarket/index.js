import {
    getAllElements,
    getArrayElementInnerNumber,
    getFirstElement,
    hideElement,
    insertAfter,
    showElement,
    showHideElement,
} from '../common/dom';
import { StorageValue } from '../common/storage';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    isLessThanFilter,
} from '../common/filter';

const SEARCH_CONTROLS_SELECTOR = '[data-apiary-widget-name="@marketplace/SearchControls"]';
const VIRTUOSO_SCROLLER_SELECTOR = '[data-virtuoso-scroller="true"]';
const PRODUCT_CARD_SNIPPET_SELECTOR = '[data-autotest-id="product-snippet"]';
const PRODUCT_CARD_PARENT_ATTRIBUTE = 'data-apiary-widget-name';

const CATEGORY_NAME = getCategoryName();

const minReviewsFilter =
    new StorageValue(`${CATEGORY_NAME}-min-reviews-filter`);
const minRatingFilter =
    new StorageValue(`${CATEGORY_NAME}-min-rating-filter`, 4.8);
const filterEnabled =
    new StorageValue(`${CATEGORY_NAME}-filter-enabled`, true);

function getCategoryName() {
    const { pathname } = window.location;
    const pathElements = pathname.split('/');
    const categoryName = pathElements[1] ?? 'common';

    return categoryName;
}

const searchControls = getFirstElement(SEARCH_CONTROLS_SELECTOR);

if (searchControls) {
    appendFilterControlsIfNeeded(searchControls, appendFiltersContainer);

    setInterval(cleanList, 100);
}

function appendFiltersContainer(filterControls, parentNode) {
    filterControls.style =
        'display: flex;' +
        'gap: 15px;' +
        'padding: 0 10px 15px;' +
        'font-size: 16px;' +
        'font-weight: 500;';

    const controlStyle =
        'display: flex;' +
        'align-items: center;';
    const inputStyle =
        'margin: 0px 5px;';
    const numberInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'border-radius: 7px;' +
        'border: none;' +
        'padding: 9px 11px;' +
        'box-shadow: inset 0 0 0 1.5px #d2d0cc;';
    const checkboxInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 23px;' +
        'height: 23px;';

    const minReviewsDiv =
        createMinReviewsFilterControl(minReviewsFilter, controlStyle, numberInputStyle);

    const minRatingDiv =
        createMinRatingFilterControl(minRatingFilter, controlStyle, numberInputStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    filterControls.append(minReviewsDiv, minRatingDiv, filterEnabledDiv);

    insertAfter(parentNode, filterControls);
}

function cleanList() {
    const virtuosoScrollers = getAllElements(VIRTUOSO_SCROLLER_SELECTOR);
    virtuosoScrollers.forEach((virtuosoScroller) => {
        virtuosoScroller.style.minHeight = '0';
    });

    const productCardSnippets = getAllElements(PRODUCT_CARD_SNIPPET_SELECTOR);

    productCardSnippets.forEach(
        (productCardSnippet) => {
            const productCardSnippetParent = productCardSnippet.parentNode;

            const isFirstLoad =
                productCardSnippetParent.hasAttribute(PRODUCT_CARD_PARENT_ATTRIBUTE);

            const productCard = isFirstLoad
                ? productCardSnippetParent.parentNode.parentNode
                : productCardSnippetParent;

            if (!filterEnabled.value) {
                showElement(productCard);

                return;
            }

            const ratingMeter = getFirstElement('[role="meter"]', productCardSnippet);

            if (!ratingMeter) {
                hideElement(productCard);

                return;
            }

            const ratingInfoWrap = ratingMeter.parentNode;

            const ratingInfoSpans = getAllElements(':scope > span', ratingInfoWrap);

            const productCardReviewsNumber = getArrayElementInnerNumber(ratingInfoSpans, 1);

            const productCardRatingNumber = getArrayElementInnerNumber(ratingInfoSpans, 0);

            const conditionToHide =
                isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
                isLessThanFilter(productCardRatingNumber, minRatingFilter);
            showHideElement(productCard, conditionToHide);
        },
    );
}
