// ==UserScript==
// @name         Yamarket List Clean
// @namespace    https://github.com/reliable-code/product-list-filters
// @version      0.1.1
// @description  Remove product cards by filter
// @author       reliable-code
// @license      MIT
// @match        https://market.yandex.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=market.yandex.ru
// @grant        none
// ==/UserScript==

(function main() {
    const MIN_REVIEWS = 5;
    const MIN_RATING = 4.8;

    const PRODUCT_CARD_SNIPPET_SELECTOR = '[data-apiary-widget-name="@marketfront/Snippet"]';

    const CATEGORY_NAME = getCategoryName();
    const MIN_REVIEWS_LOCAL_STORAGE_KEY = `${CATEGORY_NAME}-min-reviews-filter`;
    const MIN_RATING_LOCAL_STORAGE_KEY = `${CATEGORY_NAME}-min-rating-filter`;

    const minReviewsValue = +(localStorage.getItem(MIN_REVIEWS_LOCAL_STORAGE_KEY) ?? MIN_REVIEWS);
    const minRatingValue = +(localStorage.getItem(MIN_RATING_LOCAL_STORAGE_KEY) ?? MIN_RATING);

    function getCategoryName() {
        const { pathname } = window.location;
        const pathElements = pathname.split('/');
        const categoryName = pathElements[1] ?? 'common';

        return categoryName;
    }

    setInterval(cleanList, 500);

    function cleanList() {
        const productCardSnippets = document.querySelectorAll(PRODUCT_CARD_SNIPPET_SELECTOR);

        productCardSnippets.forEach(
            (productCardSnippet) => {
                const productCard = productCardSnippet.parentNode.parentNode;

                const ratingMeter = productCardSnippet.querySelector('[role="meter"]');

                if (!ratingMeter) {
                    productCard.remove();

                    return;
                }

                const ratingInfoWrap = ratingMeter.parentNode;

                const ratingInfoSpans = ratingInfoWrap.querySelectorAll(':scope > span');

                const productCardReviews = ratingInfoSpans[1];
                const productCardReviewsText = productCardReviews.innerText;
                const productCardReviewsDigit = +productCardReviewsText;

                const productCardRating = ratingInfoSpans[0];
                const productCardRatingText = productCardRating.innerText;
                const productCardRatingDigit = +productCardRatingText;

                if (productCardReviewsDigit < minReviewsValue
                    || productCardRatingDigit < minRatingValue) {
                    productCard.remove();
                }
            },
        );
    }
}());
