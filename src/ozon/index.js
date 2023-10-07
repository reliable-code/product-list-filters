import { thumbsDownIcon } from './icons';
import {
    createDiv,
    createFilterControlNumber,
    createMinRatingFilterControl,
    getAllElements,
    getArrayElementInnerNumber,
    getFirstElement,
    hideElement,
    insertAfter,
    showElement,
    updateValue,
    waitForElement,
} from '../common/dom';
import { getLocalStorageValueOrDefault } from '../common/storage';

const CATEGORY_NAME = getCategoryName();
const MIN_REVIEWS_LOCAL_STORAGE_KEY = `${CATEGORY_NAME}-min-reviews-filter`;
const MIN_RATING_LOCAL_STORAGE_KEY = `${CATEGORY_NAME}-min-rating-filter`;

const PAGINATOR_CONTENT_SELECTOR = '#paginatorContent';
const PRODUCT_REVIEWS_WRAP_SELECTOR = '[data-widget="webReviewProductScore"]';
const COMMENTS_SELECTOR = '#comments';

const SEARCH_RESULTS_SORT_SELECTOR = '[data-widget="searchResultsSort"]';
const SEARCH_RESULT_SELECTOR = '.widget-search-result-container';
const PRODUCT_CARD_RATING_WRAP_SELECTOR = '.tsBodyMBold';
const CREATE_REVIEW_BUTTON_SELECTOR = '[data-widget="createReviewButton"]';

const MIN_REVIEWS = 50;
const MIN_RATING = 4.8;

let minReviewsValue = getLocalStorageValueOrDefault(MIN_REVIEWS_LOCAL_STORAGE_KEY, MIN_REVIEWS);
let minRatingValue = getLocalStorageValueOrDefault(MIN_RATING_LOCAL_STORAGE_KEY, MIN_RATING);

function getCategoryName() {
    const { pathname } = window.location;
    const pathElements = pathname.split('/');
    const categoryName = pathElements[2] ?? 'common';

    return categoryName;
}

const paginatorContent = getFirstElement(document, PAGINATOR_CONTENT_SELECTOR);
const comments = getFirstElement(document, COMMENTS_SELECTOR);

if (paginatorContent) {
    await initListClean();
} else if (comments) {
    comments.scrollIntoView();
} else {
    await appendBadReviewsLinkAndRatingValue();
}

async function initListClean() {
    const searchResultsSort = await waitForElement(document, SEARCH_RESULTS_SORT_SELECTOR);

    const controlStyle =
        'padding-left: 14px; margin-top: 12px;';
    const inputStyle =
        'border: 2px solid #b3bcc5; border-radius: 6px; padding: 6px 10px; width: 90px;';

    const minReviewsDiv =
        createFilterControlNumber(
            'Минимально отзывов: ',
            minReviewsValue,
            '1',
            '1',
            '999999',
            updateMinReviewsInput,
            controlStyle,
            inputStyle,
        );

    const minRatingDiv =
        createMinRatingFilterControl(
            minRatingValue,
            updateMinRatingInput,
            controlStyle,
            inputStyle,
        );

    searchResultsSort.append(minReviewsDiv, minRatingDiv);

    setInterval(cleanList, 100);
}

function updateMinReviewsInput(e) {
    minReviewsValue = updateValue(e, MIN_REVIEWS_LOCAL_STORAGE_KEY);
}

function updateMinRatingInput(e) {
    minRatingValue = updateValue(e, MIN_RATING_LOCAL_STORAGE_KEY);
}

function cleanList() {
    const searchResultContainer = getFirstElement(document, SEARCH_RESULT_SELECTOR, true);
    const productCardsWrap = getFirstElement(searchResultContainer, ':scope > div', true);
    const productCards = getAllElements(productCardsWrap, ':scope > div');

    productCards.forEach(
        (productCard) => {
            const productCardRatingWrap =
                getFirstElement(productCard, PRODUCT_CARD_RATING_WRAP_SELECTOR);

            if (!productCardRatingWrap) {
                hideElement(productCard);

                return;
            }

            const productCardRatingWrapSpans = getAllElements(productCardRatingWrap, ':scope > span', true);

            const productCardReviewsNumber =
                getArrayElementInnerNumber(productCardRatingWrapSpans, 1);

            const productCardRatingNumber =
                getArrayElementInnerNumber(productCardRatingWrapSpans, 0);

            if (productCardReviewsNumber < minReviewsValue
                || productCardRatingNumber < minRatingValue) {
                hideElement(productCard);
            } else {
                showElement(productCard, 'flex');
            }
        },
    );
}

async function appendBadReviewsLinkAndRatingValue() {
    const productReviewsWrap = await waitForElement(document, PRODUCT_REVIEWS_WRAP_SELECTOR, 1500);

    if (productReviewsWrap) {
        appendBadReviewsLink(productReviewsWrap);
        await appendRatingValue(productReviewsWrap);
    }
}

function appendBadReviewsLink(productReviewsWrap) {
    const productReviewsLink = getFirstElement(productReviewsWrap, 'a');

    if (productReviewsLink) {
        const productReviewsWrapParent = productReviewsWrap.parentNode;

        const productBadReviewsLinkWrap = document.createElement('div');

        const productBadReviewsLink = document.createElement('a');
        productBadReviewsLink.innerHTML = thumbsDownIcon;
        productBadReviewsLink.style = 'align-items: center; display: flex;';
        productBadReviewsLink.href = `${productReviewsLink.href}?sort=score_asc`;

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

async function appendRatingValue(productReviewsWrap) {
    const createReviewButton =
        await waitForElement(document, CREATE_REVIEW_BUTTON_SELECTOR);

    const reviewsInfoContainer = createReviewButton.parentNode;
    const ratingInfoContainer =
        await waitForElement(reviewsInfoContainer, ':scope > div:not([data-widget]', 2000);
    const ratingValueContainer = ratingInfoContainer.children[0].children[0].children[1];

    let ratingValue;

    try {
        [ratingValue] =
            ratingValueContainer.innerText
                .replace(/\s/g, '')
                .split('/');
    } catch (e) {
        console.log(`Failed to get ratingValue: ${e.message}`);
    }

    if (!ratingValue) return;

    const starsContainer = productReviewsWrap.children[0].children[0].children[0];

    const ratingValueDivStyle = 'margin: 0 4px; color: #005bff;';
    const ratingValueDiv = createDiv(ratingValue, ratingValueDivStyle);

    starsContainer.append(ratingValueDiv);
}
