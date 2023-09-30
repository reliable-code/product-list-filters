import { getElementInnerNumber } from '../common/dom';

const CATEGORY_NAME = getCategoryName();
const MIN_REVIEWS_LOCAL_STORAGE_KEY = `${CATEGORY_NAME}-min-reviews-filter`;
const MIN_RATING_LOCAL_STORAGE_KEY = `${CATEGORY_NAME}-min-rating-filter`;

const PAGINATOR_CONTENT_SELECTOR = '#paginatorContent';
const ADV_SEARCH_SHELF_SELECTOR = '[data-widget="skuAdvSearchShelf"]';
const RESULTS_HEADER_SELECTOR = '[data-widget="resultsHeader"]';

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

function initListClean() {
    const searchResultsSort = document.querySelector(SEARCH_RESULTS_SORT_SELECTOR);

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

function updateInput(keyName, e) {
    localStorage.setItem(keyName, e.target.value);
    window.location.reload();
}

function createFilterControl(
    titleText, inputValue, inputStep, inputMinValue, inputMaxValue, inputOnChange,
) {
    const controlStyle =
        'padding-left: 14px; margin-top: 12px;';
    const inputStyle =
        'border: 2px solid #b3bcc5; border-radius: 6px; padding: 6px 10px; width: 90px;';

    const filterControl =
        createDefaultFilterControl(
            controlStyle,
            titleText,
            inputStyle,
            inputValue,
            inputStep,
            inputMinValue,
            inputMaxValue,
            inputOnChange,
        );

    return filterControl;
}

function createDefaultFilterControl(
    controlStyle,
    titleText,
    inputStyle,
    inputValue,
    inputStep,
    inputMinValue,
    inputMaxValue,
    inputOnChange,
) {
    const filterControl = document.createElement('div');
    filterControl.style = controlStyle;
    filterControl.textContent = titleText;

    const input = document.createElement('input');
    input.style = inputStyle;
    input.type = 'number';
    input.value = inputValue;
    input.step = inputStep;
    input.min = inputMinValue;
    input.max = inputMaxValue;
    input.addEventListener('change', inputOnChange);
    filterControl.appendChild(input);

    return filterControl;
}

function cleanList() {
    const searchResultContainer = document.querySelector(SEARCH_RESULT_SELECTOR);
    const productCardsWrap = searchResultContainer.querySelector(':scope > div');
    const productCards = productCardsWrap.querySelectorAll(':scope > div');

    productCards.forEach(
        (productCard) => {
            const productCardRatingWrap =
                productCard.querySelector(PRODUCT_CARD_RATING_WRAP_SELECTOR);

            if (!productCardRatingWrap) {
                productCard.remove();

                return;
            }

            const productCardRatingWrapSpans = productCardRatingWrap.querySelectorAll(':scope > span');

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
