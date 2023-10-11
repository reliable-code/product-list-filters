import { thumbsDownIcon } from './icons';
import {
    createDiv,
    createLink,
    getAllElements,
    getArrayElementInnerNumber,
    getFirstElement,
    hideElement,
    insertAfter,
    showElement,
    showHideElement,
    waitForElement,
} from '../common/dom';
import { getStorageValueOrDefault, setStorageValueFromEvent } from '../common/storage';
import { removeSpaces } from '../common/string';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
} from '../common/filter';

const CATEGORY_NAME = getCategoryName();
const MIN_REVIEWS_STORAGE_KEY = `${CATEGORY_NAME}-min-reviews-filter`;
const MIN_RATING_STORAGE_KEY = `${CATEGORY_NAME}-min-rating-filter`;
const FILTER_ENABLED_STORAGE_KEY = `${CATEGORY_NAME}-filter-enabled`;

const PAGINATOR_CONTENT_SELECTOR = '#paginatorContent';
const PRODUCT_REVIEWS_WRAP_SELECTOR = '[data-widget="webReviewProductScore"]';
const COMMENTS_SELECTOR = '#comments';

const SEARCH_RESULTS_SORT_SELECTOR = '[data-widget="searchResultsSort"]';
const SEARCH_RESULT_SELECTOR = '.widget-search-result-container';
const PRODUCT_CARD_RATING_WRAP_SELECTOR = '.tsBodyMBold';
const CREATE_REVIEW_BUTTON_SELECTOR = '[data-widget="createReviewButton"]';

const MIN_REVIEWS = 50;
const MIN_RATING = 4.8;
const FILTER_ENABLED = true;

let minReviewsValue = getStorageValueOrDefault(MIN_REVIEWS_STORAGE_KEY, MIN_REVIEWS);
let minRatingValue = getStorageValueOrDefault(MIN_RATING_STORAGE_KEY, MIN_RATING);
let filterEnabledChecked = getStorageValueOrDefault(FILTER_ENABLED_STORAGE_KEY, FILTER_ENABLED);

function getCategoryName() {
    const { pathname } = window.location;
    const pathElements = pathname.split('/');
    const categoryName = pathElements[2] ?? 'common';

    return categoryName;
}

const paginatorContent = getFirstElement(PAGINATOR_CONTENT_SELECTOR);
const comments = getFirstElement(COMMENTS_SELECTOR);

if (paginatorContent) {
    initListClean();
} else if (comments) {
    comments.scrollIntoView();
} else {
    appendBadReviewsLinkAndRatingValue();
}

function initListClean() {
    waitForElement(document, SEARCH_RESULTS_SORT_SELECTOR)
        .then((searchResultsSort) => {
            appendFilterControlsIfNeeded(searchResultsSort, appendFiltersContainer);

            setInterval(cleanList, 100);
        });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    filtersContainer.style =
        'display: flex;' +
        'grid-gap: 15px;' +
        'margin: 14px 0px 0px 15px;';

    const controlStyle =
        'display: flex;' +
        'align-items: center;';
    const numberInputStyle =
        'border: 2px solid #b3bcc5;' +
        'border-radius: 6px;' +
        'padding: 6px 10px;' +
        'width: 90px;';
    const checkboxInputStyle =
        'width: 25px;' +
        'height: 25px;';

    const minReviewsDiv =
        createMinReviewsFilterControl(
            minReviewsValue,
            updateMinReviewsValue,
            controlStyle,
            numberInputStyle,
        );

    const minRatingDiv =
        createMinRatingFilterControl(
            minRatingValue,
            updateMinRatingValue,
            controlStyle,
            numberInputStyle,
        );

    const filterEnabledDiv =
        createEnabledFilterControl(
            filterEnabledChecked,
            updateFilterEnabledValue,
            controlStyle,
            checkboxInputStyle,
        );

    filtersContainer.append(minReviewsDiv, minRatingDiv, filterEnabledDiv);

    parentNode.append(filtersContainer);
}

function updateMinReviewsValue(e) {
    minReviewsValue = setStorageValueFromEvent(e, MIN_REVIEWS_STORAGE_KEY);
}

function updateMinRatingValue(e) {
    minRatingValue = setStorageValueFromEvent(e, MIN_RATING_STORAGE_KEY);
}

function updateFilterEnabledValue(e) {
    filterEnabledChecked = setStorageValueFromEvent(e, FILTER_ENABLED_STORAGE_KEY);
}

function cleanList() {
    const searchResultContainer = getFirstElement(SEARCH_RESULT_SELECTOR, document, true);
    const productCardsWrap = getFirstElement(':scope > div', searchResultContainer, true);
    const productCards = getAllElements(':scope > div', productCardsWrap);

    productCards.forEach(
        (productCard) => {
            if (!filterEnabledChecked) {
                showElement(productCard);

                return;
            }

            const productCardRatingWrap =
                getFirstElement(PRODUCT_CARD_RATING_WRAP_SELECTOR, productCard);

            if (!productCardRatingWrap) {
                hideElement(productCard);

                return;
            }

            const productCardRatingWrapSpans =
                getAllElements(':scope > span', productCardRatingWrap, true);

            const productCardReviewsNumber =
                getArrayElementInnerNumber(productCardRatingWrapSpans, 1);

            const productCardRatingNumber =
                getArrayElementInnerNumber(productCardRatingWrapSpans, 0);

            const conditionToHide =
                productCardReviewsNumber < minReviewsValue ||
                productCardRatingNumber < minRatingValue;
            showHideElement(productCard, conditionToHide, 'flex');
        },
    );
}

function appendBadReviewsLinkAndRatingValue() {
    waitForElement(document, PRODUCT_REVIEWS_WRAP_SELECTOR, 1500)
        .then((productReviewsWrap) => {
            if (!productReviewsWrap) return;

            appendBadReviewsLink(productReviewsWrap);
            appendRatingValue(productReviewsWrap);
        });
}

function appendBadReviewsLink(productReviewsWrap) {
    const productReviewsLink = getFirstElement('a', productReviewsWrap);

    if (productReviewsLink) {
        const productReviewsWrapParent = productReviewsWrap.parentNode;

        const productBadReviewsLinkWrap = createDiv();

        const productBadReviewsLink =
            createLink(
                `${productReviewsLink.href}?sort=score_asc`,
                thumbsDownIcon,
                'align-items: center; display: flex;',
            );

        const productBadReviewsLinkSpan = document.createElement('span');
        productBadReviewsLinkSpan.style = 'padding-left: 8px;';
        productBadReviewsLinkSpan.textContent = 'Плохие отзывы';

        productBadReviewsLink.append(productBadReviewsLinkSpan);

        productBadReviewsLinkWrap.append(productBadReviewsLink);

        const isInStickyContainer =
            productReviewsWrapParent.parentNode.matches('[data-widget="stickyContainer"]');

        if (isInStickyContainer) {
            productBadReviewsLinkWrap.style = 'margin-top: 10px;';

            insertAfter(productReviewsWrapParent, productBadReviewsLinkWrap);
        } else {
            insertAfter(productReviewsWrap, productBadReviewsLinkWrap);
        }
    }
}

function appendRatingValue(productReviewsWrap) {
    waitForElement(document, CREATE_REVIEW_BUTTON_SELECTOR)
        .then((createReviewButton) => {
            const reviewsInfoContainer = createReviewButton.parentNode;

            waitForElement(reviewsInfoContainer, ':scope > div:not([data-widget]', 2000)
                .then((ratingInfoContainer) => {
                    const ratingValueContainer =
                        ratingInfoContainer.children[0].children[0].children[1];

                    const ratingValue = getRatingValue(ratingValueContainer);

                    if (!ratingValue) return;

                    const starsContainer = productReviewsWrap.children[0].children[0].children[0];

                    const ratingValueDivStyle = 'margin: 0 4px; color: #005bff;';
                    const ratingValueDiv = createDiv(ratingValue, ratingValueDivStyle);

                    starsContainer.append(ratingValueDiv);
                });
        });
}

function getRatingValue(ratingValueContainer) {
    let ratingValue;

    try {
        [ratingValue] =
            removeSpaces(ratingValueContainer.innerText)
                .split('/');
    } catch (e) {
        console.log(`Failed to get ratingValue: ${e.message}`);
    }

    return ratingValue;
}
