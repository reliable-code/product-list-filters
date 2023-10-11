import {
    getAllElements,
    getArrayElementInnerNumber,
    getFirstElement,
    insertAfter,
    showHideElement,
} from '../common/dom';
import { getStorageValueOrDefault, setStorageValueFromEvent } from '../common/storage';
import {
    appendFilterControlsIfNeeded,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
} from '../common/filter';

const MIN_REVIEWS = 5;
const MIN_RATING = 4.8;

const SEARCH_CONTROLS_SELECTOR = '[data-apiary-widget-name="@marketplace/SearchControls"]';
const VIRTUOSO_SCROLLER_SELECTOR = '[data-virtuoso-scroller="true"]';
const PRODUCT_CARD_SNIPPET_SELECTOR = '[data-autotest-id="product-snippet"]';
const PRODUCT_CARD_PARENT_ATTRIBUTE = 'data-apiary-widget-name';

const CATEGORY_NAME = getCategoryName();
const MIN_REVIEWS_STORAGE_KEY = `${CATEGORY_NAME}-min-reviews-filter`;
const MIN_RATING_STORAGE_KEY = `${CATEGORY_NAME}-min-rating-filter`;

let minReviewsValue = getStorageValueOrDefault(MIN_REVIEWS_STORAGE_KEY, MIN_REVIEWS);
let minRatingValue = getStorageValueOrDefault(MIN_RATING_STORAGE_KEY, MIN_RATING);

function getCategoryName() {
    const { pathname } = window.location;
    const pathElements = pathname.split('/');
    const categoryName = pathElements[1] ?? 'common';

    return categoryName;
}

const searchControls = getFirstElement(SEARCH_CONTROLS_SELECTOR);

if (searchControls) {
    appendFilterControlsIfNeeded(searchControls, appendFiltersContainer);

    setInterval(cleanList, 500);
}

function appendFiltersContainer(filterControls, parentNode) {
    filterControls.style =
        'display: flex;' +
        'gap: 10px;' +
        'padding: 0 10px 15px;' +
        'font-size: 16px;' +
        'font-weight: 500;';

    const inputStyle =
        'border-radius: 7px;' +
        'border: none;' +
        'padding: 9px 11px;' +
        'box-shadow: inset 0 0 0 1.5px #d2d0cc;';

    const minReviewsDiv =
        createMinReviewsFilterControl(
            minReviewsValue, updateMinReviewsValue, '', inputStyle,
        );

    const minRatingDiv =
        createMinRatingFilterControl(
            minRatingValue, updateMinRatingValue, '', inputStyle,
        );

    filterControls.append(minReviewsDiv, minRatingDiv);

    insertAfter(parentNode, filterControls);
}

function updateMinReviewsValue(e) {
    minReviewsValue = setStorageValueFromEvent(e, MIN_REVIEWS_STORAGE_KEY);
}

function updateMinRatingValue(e) {
    minRatingValue = setStorageValueFromEvent(e, MIN_RATING_STORAGE_KEY);
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

            const ratingMeter = getFirstElement('[role="meter"]', productCardSnippet);

            if (!ratingMeter) {
                productCard.remove();

                return;
            }

            const ratingInfoWrap = ratingMeter.parentNode;

            const ratingInfoSpans = getAllElements(':scope > span', ratingInfoWrap);

            const productCardReviewsNumber = getArrayElementInnerNumber(ratingInfoSpans, 1);

            const productCardRatingNumber = getArrayElementInnerNumber(ratingInfoSpans, 0);

            const conditionToHide =
                productCardReviewsNumber < minReviewsValue ||
                productCardRatingNumber < minRatingValue;
            showHideElement(productCard, conditionToHide);
        },
    );
}
