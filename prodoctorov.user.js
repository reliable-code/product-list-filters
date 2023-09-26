// ==UserScript==
// @name         Prodoctorov List Clean
// @namespace    https://github.com/reliable-code/product-list-filters
// @version      0.1
// @description  Remove product cards by filter
// @author       reliable-code
// @license      MIT
// @match        https://www.prodoctorov.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=prodoctorov.ru
// @grant        none
// ==/UserScript==

(function main() {
    const MIN_REVIEWS_LOCAL_STORAGE_KEY = 'minReviewsFilter';

    function updateMinReviewsInput(e) {
        updateInput(MIN_REVIEWS_LOCAL_STORAGE_KEY, e);
    }

    function updateInput(keyName, e) {
        localStorage.setItem(keyName, e.target.value);
        window.location.reload();
    }
}());
