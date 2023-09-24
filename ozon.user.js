// ==UserScript==
// @name         Ozon List Clean
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.ozon.ru/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ozon.ru
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const MIN_REVIEWS_LOCAL_STORAGE_KEY = "minReviewsFilter";
    const MIN_RATING_LOCAL_STORAGE_KEY = "minRatingFilter";

    const SEARCH_RESULT_SELECTOR = ".widget-search-result-container";
    const PRODUCT_CARD_RATING_WRAP_SELECTOR = ".tsBodyMBold";

    const MIN_REVIEWS = 50;
    const MIN_RATING = 4.8;

    let minReviewsValue = localStorage.getItem(MIN_REVIEWS_LOCAL_STORAGE_KEY) ?? MIN_REVIEWS;
    let minRatingValue = localStorage.getItem(MIN_RATING_LOCAL_STORAGE_KEY) ?? MIN_RATING;

    if (document.querySelector("#paginatorContent")) {
        window.scrollTo(0, document.body.scrollHeight);
        setTimeout(function () {
            const resultsHeader = document.querySelector('[data-widget="resultsHeader"]');

            if (resultsHeader) {
                resultsHeader.scrollIntoView();
            } else {
                window.scrollTo(0, 0);
            }

            initListClean();
        }, 1000);

        function initListClean() {
            const searchResultsSort = document.querySelector('[data-widget="searchResultsSort"]');

            const minDivStyle = "padding-left: 14px; margin-top: 12px;";
            const minInputStyle = "border: 2px solid #b3bcc5; border-radius: 6px; padding: 6px 10px;";

            const minReviewsDiv = document.createElement("div");
            minReviewsDiv.style = minDivStyle;
            const minReviewsDivText = document.createTextNode("Минимально отзывов: ");
            minReviewsDiv.appendChild(minReviewsDivText);

            const minReviewsInput = document.createElement("input");
            minReviewsInput.type = "number";
            minReviewsInput.value = minReviewsValue;
            minReviewsInput.style = minInputStyle;
            minReviewsInput.addEventListener("change", updateMinReviewsInput);
            minReviewsDiv.appendChild(minReviewsInput);

            const minRatingDiv = document.createElement("div");
            minRatingDiv.style = minDivStyle;
            const minRatingDivText = document.createTextNode("Минимальный рейтинг: ");
            minRatingDiv.appendChild(minRatingDivText);

            const minRatingInput = document.createElement("input");
            minRatingInput.type = "number";
            minRatingInput.value = minRatingValue;
            minRatingInput.style = minInputStyle;
            minRatingInput.addEventListener("change", updateMinRatingInput);
            minRatingDiv.appendChild(minRatingInput);

            searchResultsSort.appendChild(minReviewsDiv);
            searchResultsSort.appendChild(minRatingDiv);

            cleanList();

            window.addEventListener('scroll', function () {
                cleanList();
            });
        }

        function cleanList() {
            const searchResultContainer = document.querySelector(SEARCH_RESULT_SELECTOR);
            const productCardsWrap = searchResultContainer.querySelector(":scope > div");
            let productCards = productCardsWrap.querySelectorAll(":scope > div");

            // if (!productCards.length) {
            //     productCards = document.querySelectorAll(PRODUCT_CARD_LIST_SELECTOR);
            // }
            productCards.forEach(
                (element) => {
                    let productCardRatingWrap = element.querySelector(PRODUCT_CARD_RATING_WRAP_SELECTOR);

                    if (!productCardRatingWrap) {
                        element.remove();

                        return;
                    }

                    const productCardRatingWrapSpans = productCardRatingWrap.querySelectorAll(":scope > span");

                    let productCardCount = productCardRatingWrapSpans[1];

                    const productCardCountText = productCardCount.innerText;
                    const productCardCountDigit = +productCardCountText;

                    let productCardRating = productCardRatingWrapSpans[0];

                    const productCardRatingText = productCardRating.innerText;
                    const productCardRatingDigit = +productCardRatingText;

                    if (productCardCountDigit < minReviewsValue || productCardRatingDigit < minRatingValue) {
                        element.remove();
                        //productCard.style.backgroundColor = "red";
                    }
                }
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
    }
})();