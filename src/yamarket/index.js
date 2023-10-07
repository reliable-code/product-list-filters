import {
    createFilterControlNumber,
    getArrayElementInnerNumber,
    insertAfter,
    updateValue,
} from '../common/dom';
import { getLocalStorageValueOrDefault } from '../common/storage';

const MIN_REVIEWS = 5;
const MIN_RATING = 4.8;

const SEARCH_WRAP_SELECTOR = '[data-grabber="SearchSerp"]';
const SEARCH_CONTROLS_SELECTOR = '[data-apiary-widget-name="@marketplace/SearchControls"]';
const VIRTUOSO_SCROLLER_SELECTOR = '[data-virtuoso-scroller="true"]';
const PRODUCT_CARD_SNIPPET_SELECTOR = '[data-autotest-id="product-snippet"]';
const PRODUCT_CARD_PARENT_ATTRIBUTE = 'data-apiary-widget-name';

const CATEGORY_NAME = getCategoryName();
const MIN_REVIEWS_LOCAL_STORAGE_KEY = `${CATEGORY_NAME}-min-reviews-filter`;
const MIN_RATING_LOCAL_STORAGE_KEY = `${CATEGORY_NAME}-min-rating-filter`;

const minReviewsValue = getLocalStorageValueOrDefault(MIN_REVIEWS_LOCAL_STORAGE_KEY, MIN_REVIEWS);
const minRatingValue = getLocalStorageValueOrDefault(MIN_RATING_LOCAL_STORAGE_KEY, MIN_RATING);

function getCategoryName() {
    const { pathname } = window.location;
    const pathElements = pathname.split('/');
    const categoryName = pathElements[1] ?? 'common';

    return categoryName;
}

const searchWrap = document.querySelector(SEARCH_WRAP_SELECTOR);

if (searchWrap) {
    const searchControls =
        document.querySelector(SEARCH_CONTROLS_SELECTOR);

    if (searchControls) appendFilterControls(searchControls);

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
        createFilterControlNumber('Минимально отзывов: ',
            minReviewsValue,
            '1',
            '1',
            '999999',
            updateMinReviewsInput,
            '',
            inputStyle);

    const minRatingDiv =
        createFilterControlNumber('Минимальный рейтинг: ',
            minRatingValue,
            '0.1',
            '4.0',
            '5.0',
            updateMinRatingInput,
            '',
            inputStyle);

    filterControls.append(minReviewsDiv, minRatingDiv);

    insertAfter(parentNode, filterControls);
}

function appendFilterControls(searchControls) {
    const filterControls = document.createElement('div');
    appendFiltersContainer(filterControls, searchControls);
}

function updateMinReviewsInput(e) {
    updateValue(e, MIN_REVIEWS_LOCAL_STORAGE_KEY);
}

function updateMinRatingInput(e) {
    updateValue(e, MIN_RATING_LOCAL_STORAGE_KEY);
}

function cleanList() {
    const virtuosoScroller = searchWrap.querySelector(VIRTUOSO_SCROLLER_SELECTOR);
    if (virtuosoScroller) virtuosoScroller.style.minHeight = '0';

    const productCardSnippets = searchWrap.querySelectorAll(PRODUCT_CARD_SNIPPET_SELECTOR);

    productCardSnippets.forEach(
        (productCardSnippet) => {
            const productCardSnippetParent = productCardSnippet.parentNode;

            const isFirstLoad =
                productCardSnippetParent.hasAttribute(PRODUCT_CARD_PARENT_ATTRIBUTE);

            const productCard = isFirstLoad
                ? productCardSnippetParent.parentNode.parentNode
                : productCardSnippetParent;

            const ratingMeter = productCardSnippet.querySelector('[role="meter"]');

            if (!ratingMeter) {
                productCard.remove();

                return;
            }

            const ratingInfoWrap = ratingMeter.parentNode;

            const ratingInfoSpans = ratingInfoWrap.querySelectorAll(':scope > span');

            const productCardReviewsNumber = getArrayElementInnerNumber(ratingInfoSpans, 1);

            const productCardRatingNumber = getArrayElementInnerNumber(ratingInfoSpans, 0);

            if (productCardReviewsNumber < minReviewsValue
                || productCardRatingNumber < minRatingValue) {
                productCard.remove();
            }
        },
    );
}
