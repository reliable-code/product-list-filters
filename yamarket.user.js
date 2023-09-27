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
}());
