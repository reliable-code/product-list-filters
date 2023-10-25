import { thumbsDownIcon } from './icons';
import {
    addGlobalStyle,
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
import { StorageValue } from '../common/storage';
import { removeSpaces } from '../common/string';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
} from '../common/filter';

const PAGINATOR_CONTENT_SELECTOR = '#paginatorContent';
const PRODUCT_REVIEWS_WRAP_SELECTOR = '[data-widget="webReviewProductScore"]';
const COMMENTS_SELECTOR = '#comments';

const SEARCH_RESULTS_SORT_SELECTOR = '[data-widget="searchResultsSort"]';
const SEARCH_RESULT_SELECTOR = '.widget-search-result-container';
const PRODUCT_CARD_RATING_WRAP_SELECTOR = '.tsBodyMBold';
const CREATE_REVIEW_BUTTON_SELECTOR = '[data-widget="createReviewButton"]';

const CATEGORY_NAME = getCategoryName();

const minReviewsFilter =
    new StorageValue(`${CATEGORY_NAME}-min-reviews-filter`, 50);
const minRatingFilter =
    new StorageValue(`${CATEGORY_NAME}-min-rating-filter`, 4.8);
const filterEnabled =
    new StorageValue(`${CATEGORY_NAME}-filter-enabled`, true);

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
    addGlobalStyle(
        'input[type=number]::-webkit-inner-spin-button,' +
        'input[type=number]::-webkit-outer-spin-button {' +
        '    -webkit-appearance: auto;' +
        '}',
    );

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
        createMinReviewsFilterControl(minReviewsFilter, controlStyle, numberInputStyle);

    const minRatingDiv =
        createMinRatingFilterControl(minRatingFilter, controlStyle, numberInputStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    filtersContainer.append(minReviewsDiv, minRatingDiv, filterEnabledDiv);

    parentNode.append(filtersContainer);

    parentNode.style =
        'position: sticky;' +
        'top: 62px;' +
        'background-color: #fff;' +
        'z-index: 1;' +
        'padding-bottom: 11px;' +
        'margin-bottom: 0;';
}

function cleanList() {
    const searchResultContainer = getFirstElement(SEARCH_RESULT_SELECTOR, document, true);
    const productCardsWrap = getFirstElement(':scope > div', searchResultContainer, true);
    const productCards = getAllElements(':scope > div', productCardsWrap);

    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                showElement(productCard, 'flex');

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
                productCardReviewsNumber < minReviewsFilter.value ||
                productCardRatingNumber < minRatingFilter.value;
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

                    const ratingValueSpan = ratingValueContainer.children[0];
                    const ratingValue = getRatingValue(ratingValueSpan);

                    if (!ratingValue) return;

                    const starsContainer = productReviewsWrap.children[0].children[0].children[0];

                    const ratingValueDivStyle = 'margin: 0 4px; color: #005bff;';
                    const ratingValueDiv = createDiv(ratingValue, ratingValueDivStyle);

                    starsContainer.append(ratingValueDiv);
                });
        });
}

function getRatingValue(ratingValueSpan) {
    let ratingValue;

    try {
        [ratingValue] =
            removeSpaces(ratingValueSpan.innerHTML)
                .split('/');
    } catch (e) {
        console.log(`Failed to get ratingValue: ${e.message}`);
    }

    return ratingValue;
}
