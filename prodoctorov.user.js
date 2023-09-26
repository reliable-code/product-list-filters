// ==UserScript==
// @name         Prodoctorov List Clean
// @namespace    https://github.com/reliable-code/product-list-filters
// @version      0.1
// @description  Remove product cards by filter
// @author       reliable-code
// @license      MIT
// @match        https://prodoctorov.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=prodoctorov.ru
// @grant        none
// ==/UserScript==

(function main() {
    const MIN_REVIEWS_LOCAL_STORAGE_KEY = 'minReviewsFilter';

    const APPOINTMENTS_PAGE = '.appointments_page';
    const SPECIAL_PLACEMENT_CARD_SELECTOR = '.b-doctor-card_special-placement';

    const MIN_REVIEWS = 10;

    const minReviewsValue = +(localStorage.getItem(MIN_REVIEWS_LOCAL_STORAGE_KEY) ?? MIN_REVIEWS);

    const appointmentsPage = document.querySelector(APPOINTMENTS_PAGE);

    if (appointmentsPage) {
        const specialPlacementCards = document.querySelectorAll(SPECIAL_PLACEMENT_CARD_SELECTOR);
        specialPlacementCards.forEach(
            (specialPlacementCard) => specialPlacementCard.remove(),
        );
    }

    function updateMinReviewsInput(e) {
        updateInput(MIN_REVIEWS_LOCAL_STORAGE_KEY, e);
    }

    function updateInput(keyName, e) {
        localStorage.setItem(keyName, e.target.value);
        window.location.reload();
    }
}());
