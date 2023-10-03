import {
    getFirstElement,
    getAllElements,
    insertAfter,
    createDefaultFilterControl,
    getElementInnerNumber,
    updateInput,
} from '../common/dom';

const CATEGORY_NAME = getCategoryName();
const MIN_REVIEWS_LOCAL_STORAGE_KEY = `${CATEGORY_NAME}-min-reviews-filter`;
const MIN_RATING_LOCAL_STORAGE_KEY = `${CATEGORY_NAME}-min-rating-filter`;

const PAGINATOR_CONTENT_SELECTOR = '#paginatorContent';
const ADV_SEARCH_SHELF_SELECTOR = '[data-widget="skuAdvSearchShelf"]';
const RESULTS_HEADER_SELECTOR = '[data-widget="resultsHeader"]';
const PRODUCT_REVIEWS_WRAP_SELECTOR = '[data-widget="webReviewProductScore"]';
const COMMENTS_SELECTOR = '#comments';

const SEARCH_RESULTS_SORT_SELECTOR = '[data-widget="searchResultsSort"]';
const SEARCH_RESULT_SELECTOR = '.widget-search-result-container';
const PRODUCT_CARD_RATING_WRAP_SELECTOR = '.tsBodyMBold';

const MIN_REVIEWS = 50;
const MIN_RATING = 4.8;

const minReviewsValue = localStorage.getItem(MIN_REVIEWS_LOCAL_STORAGE_KEY) ?? MIN_REVIEWS;
const minRatingValue = localStorage.getItem(MIN_RATING_LOCAL_STORAGE_KEY) ?? MIN_RATING;

function getCategoryName() {
    const { pathname } = window.location;
    const pathElements = pathname.split('/');
    const categoryName = pathElements[2] ?? 'common';

    return categoryName;
}

if (document.querySelector(PAGINATOR_CONTENT_SELECTOR)) {
    window.scrollTo(0, document.body.scrollHeight);
    setTimeout(() => {
        const advSearchShelf = document.querySelector(ADV_SEARCH_SHELF_SELECTOR);
        if (advSearchShelf) advSearchShelf.remove();

        const resultsHeader = document.querySelector(RESULTS_HEADER_SELECTOR);

        if (resultsHeader) {
            resultsHeader.scrollIntoView();
        } else {
            window.scrollTo(0, 0);
        }

        initListClean();
    }, 1500);
}

setTimeout(() => {
    const productReviewsWrap = document.querySelector(PRODUCT_REVIEWS_WRAP_SELECTOR);

    if (productReviewsWrap) {
        const productReviewsLink = productReviewsWrap.querySelector('a');
        if (productReviewsLink) {
            const productReviewsWrapParent = productReviewsWrap.parentNode;

            const productBadReviewsLinkWrap = document.createElement('div');

            const productBadReviewsLink = document.createElement('a');
            productBadReviewsLink.style = 'padding-left: 8px;';
            productBadReviewsLink.href = `${productReviewsLink.href}?sort=score_asc`;
            productBadReviewsLink.textContent = 'Плохие отзывы';

            const icon =
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                '<path d="M7.99997 4H17.1919C17.9865 4 18.7058 4.47039 19.0243 5.19836L21.8323 11.6167C21.9429 11.8695 22 12.1424 22 12.4184V13C22 14.1046 21.1045 15 20 15H13.5L14.7066 19.4243C14.8772 20.0498 14.5826 20.7087 14.0027 20.9986V20.9986C13.4204 21.2898 12.7134 21.1274 12.3164 20.6114L8.41472 15.5392C8.14579 15.1896 7.99997 14.7608 7.99997 14.3198V14M7.99997 4H2V14H7.99997M7.99997 4V14" stroke="#005bff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n' +
                '</svg>';
            productBadReviewsLinkWrap.innerHTML = icon;
            productBadReviewsLinkWrap.appendChild(productBadReviewsLink);

            const isInStickyContainer =
                productReviewsWrapParent.parentNode.matches('[data-widget="stickyContainer"]');

            const productBadReviewsLinkWrapStyle = 'align-items: center; display: flex;';

            if (isInStickyContainer) {
                productBadReviewsLinkWrap.style = `${productBadReviewsLinkWrapStyle} margin-top: 10px;`;

                insertAfter(productReviewsWrapParent, productBadReviewsLinkWrap);
            } else {
                productBadReviewsLinkWrap.style = productBadReviewsLinkWrapStyle;

                insertAfter(productReviewsWrap, productBadReviewsLinkWrap);
            }
        }
    }
}, 1500);

const comments = document.querySelector(COMMENTS_SELECTOR);
if (comments) {
    comments.scrollIntoView();
}

function initListClean() {
    const searchResultsSort = getFirstElement(document, SEARCH_RESULTS_SORT_SELECTOR, true);

    const minReviewsDiv =
        createFilterControl(
            'Минимально отзывов: ', minReviewsValue, '1', '1', '999999', updateMinReviewsInput,
        );

    const minRatingDiv =
        createFilterControl(
            'Минимальный рейтинг: ', minRatingValue, '0.1', '4.0', '5.0', updateMinRatingInput,
        );

    searchResultsSort.appendChild(minReviewsDiv);
    searchResultsSort.appendChild(minRatingDiv);

    cleanList();

    window.addEventListener('scroll', cleanList);
}

function updateMinReviewsInput(e) {
    updateInput(MIN_REVIEWS_LOCAL_STORAGE_KEY, e);
}

function updateMinRatingInput(e) {
    updateInput(MIN_RATING_LOCAL_STORAGE_KEY, e);
}

function createFilterControl(
    titleText, inputValue, inputStep, inputMinValue, inputMaxValue, inputOnChange,
) {
    const controlStyle =
        'padding-left: 14px; margin-top: 12px;';
    const inputStyle =
        'border: 2px solid #b3bcc5; border-radius: 6px; padding: 6px 10px; width: 90px;';

    return createDefaultFilterControl(
        titleText,
        inputValue,
        inputStep,
        inputMinValue,
        inputMaxValue,
        inputOnChange,
        controlStyle,
        inputStyle,
    );
}

function cleanList() {
    const searchResultContainer = getFirstElement(document, SEARCH_RESULT_SELECTOR, true);
    const productCardsWrap = getFirstElement(searchResultContainer, ':scope > div', true);
    const productCards = productCardsWrap.querySelectorAll(':scope > div');

    productCards.forEach(
        (productCard) => {
            const productCardRatingWrap =
                productCard.querySelector(PRODUCT_CARD_RATING_WRAP_SELECTOR);

            if (!productCardRatingWrap) {
                productCard.remove();

                return;
            }

            const productCardRatingWrapSpans = getAllElements(productCardRatingWrap, ':scope > span', true);

            const productCardReviews = productCardRatingWrapSpans[1];
            const productCardReviewsNumber = getElementInnerNumber(productCardReviews);

            const productCardRating = productCardRatingWrapSpans[0];
            const productCardRatingNumber = getElementInnerNumber(productCardRating);

            if (productCardReviewsNumber < minReviewsValue
                || productCardRatingNumber < minRatingValue) {
                productCard.remove();
            }
        },
    );
}
