// ==UserScript==
// @name         Ozon List Clean
// @namespace    https://github.com/reliable-code/product-list-filters
// @version      0.3
// @description  Remove product cards by filter
// @author       reliable-code
// @license      MIT
// @match        https://www.ozon.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ozon.ru
// @grant        none
// ==/UserScript==

(function main() {
    const CATEGORY_NAME = getCategoryName();
    const MIN_REVIEWS_LOCAL_STORAGE_KEY = `${CATEGORY_NAME}-min-reviews-filter`;
    const MIN_RATING_LOCAL_STORAGE_KEY = `${CATEGORY_NAME}-min-rating-filter`;

    const PAGINATOR_CONTENT_SELECTOR = '#paginatorContent';
    const RESULTS_HEADER_SELECTOR = '[data-widget="resultsHeader"]';

    const SEARCH_RESULTS_SORT_SELECTOR = '[data-widget="searchResultsSort"]';
    const SEARCH_RESULT_SELECTOR = '.widget-search-result-container';
    const PRODUCT_CARD_RATING_WRAP_SELECTOR = '.tsBodyMBold';

    const MIN_REVIEWS = 50;
    const MIN_RATING = 4.8;

    const minReviewsValue = localStorage.getItem(MIN_REVIEWS_LOCAL_STORAGE_KEY) ?? MIN_REVIEWS;
    const minRatingValue = localStorage.getItem(MIN_RATING_LOCAL_STORAGE_KEY) ?? MIN_RATING;

    if (document.querySelector(PAGINATOR_CONTENT_SELECTOR)) {
        window.scrollTo(0, document.body.scrollHeight);
        setTimeout(() => {
            const resultsHeader = document.querySelector(RESULTS_HEADER_SELECTOR);

            if (resultsHeader) {
                resultsHeader.scrollIntoView();
            } else {
                window.scrollTo(0, 0);
            }

            initListClean();
        }, 1000);
    }

    function getCategoryName() {
        const { pathname } = window.location;
        const pathElements = pathname.split('/');
        const categoryName = pathElements[2] ?? 'common';

        return categoryName;
    }

    function initListClean() {
        const searchResultsSort = document.querySelector(SEARCH_RESULTS_SORT_SELECTOR);

        const minDivStyle = 'padding-left: 14px; margin-top: 12px;';
        const minInputStyle = 'border: 2px solid #b3bcc5; border-radius: 6px; padding: 6px 10px;';

        const minReviewsDiv = document.createElement('div');
        minReviewsDiv.style = minDivStyle;
        const minReviewsDivText = document.createTextNode('Минимально отзывов: ');
        minReviewsDiv.appendChild(minReviewsDivText);

        const minReviewsInput = document.createElement('input');
        minReviewsInput.type = 'number';
        minReviewsInput.value = minReviewsValue;
        minReviewsInput.style = minInputStyle;
        minReviewsInput.addEventListener('change', updateMinReviewsInput);
        minReviewsDiv.appendChild(minReviewsInput);

        const minRatingDiv = document.createElement('div');
        minRatingDiv.style = minDivStyle;
        const minRatingDivText = document.createTextNode('Минимальный рейтинг: ');
        minRatingDiv.appendChild(minRatingDivText);

        const minRatingInput = document.createElement('input');
        minRatingInput.type = 'number';
        minRatingInput.value = minRatingValue;
        minRatingInput.style = minInputStyle;
        minRatingInput.addEventListener('change', updateMinRatingInput);
        minRatingDiv.appendChild(minRatingInput);

        searchResultsSort.appendChild(minReviewsDiv);
        searchResultsSort.appendChild(minRatingDiv);

        cleanList();

        window.addEventListener('scroll', cleanList);
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

                const productCardReviewsText = productCardReviews.innerText;
                const productCardReviewsDigit = +productCardReviewsText;

                const productCardRating = productCardRatingWrapSpans[0];

                const productCardRatingText = productCardRating.innerText;
                const productCardRatingDigit = +productCardRatingText;

                if (productCardReviewsDigit < minReviewsValue
                    || productCardRatingDigit < minRatingValue) {
                    productCard.remove();
                }
            },
        );
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
}());
