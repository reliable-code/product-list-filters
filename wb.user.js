// ==UserScript==
// @name         WB List Clean
// @namespace    https://github.com/reliable-code/product-list-filters
// @version      0.1
// @description  Remove product cards by filter
// @author       reliable-code
// @match        https://www.wildberries.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wildberries.ru
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const MIN_REVIEWS = 50;
    const MIN_RATING = 4.8;

    const MIN_REVIEWS_LOCAL_STORAGE_KEY = "minReviewsFilter";
    const MIN_RATING_LOCAL_STORAGE_KEY = "minRatingFilter";

    let minReviewsValue = localStorage.getItem(MIN_REVIEWS_LOCAL_STORAGE_KEY) ?? MIN_REVIEWS;
    let minRatingValue = localStorage.getItem(MIN_RATING_LOCAL_STORAGE_KEY) ?? MIN_RATING;
    let minPriceValue = getMinPriceValueFromURL();

    setTimeout(function () {
        const filtersBlockWrap = document.querySelector('.filters-block__wrap');

        if (filtersBlockWrap) {
            const filtersBlockContainer = document.createElement("div");
            filtersBlockContainer.classList.add("filters-block__container");
            filtersBlockContainer.style = "display: flex;";
            filtersBlockWrap.appendChild(filtersBlockContainer);

            appendFilterControls(filtersBlockContainer);

            setInterval(cleanList, 500);
        }
    }, 1000);

    function cleanList() {
        let productCards = document.querySelectorAll(".product-card");

        productCards.forEach(
            (productCard) => {
                let productCardCount = productCard.querySelector(".product-card__count");

                const productCardCountText = productCardCount.innerText;
                const productCardCountDigit = +productCardCountText.replace(/\D/g, "");

                let productCardRating = productCard.querySelector(".address-rate-mini");

                const productCardRatingText = productCardRating.innerText;
                const productCardRatingDigit = +productCardRatingText;

                let productCardPrice = productCard.querySelector(".price__lower-price");

                let productCardPriceDigit = 0;

                if (productCardPrice) {
                    const productCardPriceText = productCardPrice.innerText;
                    productCardPriceDigit = +productCardPriceText.replace(/\D/g, "");
                }

                if (productCardCountDigit < minReviewsValue
                    || productCardRatingDigit < minRatingValue
                    || productCardPriceDigit < minPriceValue) {
                    productCard.remove();
                    //productCard.style.backgroundColor = "red";
                }
            }
        );
    }

    function appendFilterControls(filtersBlockContainer) {
        const minDivStyle = "padding-left: 7px; margin-top: 14px;";

        const minReviewsDiv = document.createElement("div");
        minReviewsDiv.style = minDivStyle;
        minReviewsDiv.textContent = "Минимально отзывов: ";

        const minReviewsInput = document.createElement("input");
        minReviewsInput.type = "number";
        minReviewsInput.value = minReviewsValue;
        minReviewsInput.step = "1";
        minReviewsInput.min = "1";
        minReviewsInput.max = "999999";
        minReviewsInput.addEventListener("change", updateMinReviewsInput);
        minReviewsDiv.appendChild(minReviewsInput);

        const minRatingDiv = document.createElement("div");
        minRatingDiv.style = minDivStyle;
        minRatingDiv.textContent = "Минимальный рейтинг: ";

        const minRatingInput = document.createElement("input");
        minRatingInput.type = "number";
        minRatingInput.value = minRatingValue;
        minRatingInput.step = "0.1";
        minRatingInput.min = "4.0";
        minRatingInput.max = "5.0";
        minRatingInput.addEventListener("change", updateMinRatingInput);
        minRatingDiv.appendChild(minRatingInput);

        const minPriceDiv = document.createElement("div");
        minPriceDiv.style = minDivStyle;
        minPriceDiv.textContent = "Минимальная цена: " + minPriceValue;

        setInterval(checkMinPrice, 1500);

        // const minPriceInput = document.createElement("input");
        // minPriceInput.type = "number";
        // minPriceInput.value = minPriceValue;
        // minPriceInput.step = "1";
        // minPriceInput.min = "0";
        // minPriceInput.max = "999999";
        // minPriceInput.addEventListener("change", updateMinPriceInput);
        // minPriceDiv.appendChild(minPriceInput);

        filtersBlockContainer.appendChild(minReviewsDiv);
        filtersBlockContainer.appendChild(minRatingDiv);
        filtersBlockContainer.appendChild(minPriceDiv);;
    }

    function updateMinReviewsInput(e) {
        updateInput(MIN_REVIEWS_LOCAL_STORAGE_KEY, e);
    }

    function updateMinRatingInput(e) {
        updateInput(MIN_RATING_LOCAL_STORAGE_KEY, e);
    }

    function getMinPriceValueFromURL() {
        let params = new URLSearchParams(window.location.search);

        if (!params.has('priceU')) {
            return 0;
        }

        const priceFilterParams = params.get('priceU');
        const priceFilterArray = priceFilterParams.split(";");
        const minPriceValue = priceFilterArray[0] / 100;

        return minPriceValue;
    }

    function checkMinPrice() {
        let currentMinPriceValue = getMinPriceValueFromURL();

        if (minPriceValue != currentMinPriceValue) {
            window.location.reload();
        }
    }

    function updateInput(keyName, e) {
        localStorage.setItem(keyName, e.target.value);
        window.location.reload();
    }
})();