// ==UserScript==
// @name         WB List Clean
// @namespace    https://github.com/reliable-code/product-list-filters
// @version      0.3
// @description  Remove product cards by filter
// @author       reliable-code
// @match        https://www.wildberries.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wildberries.ru
// @grant        none
// ==/UserScript==

(function main() {
    const MIN_REVIEWS = 50;
    const MIN_RATING = 4.8;

    const MIN_REVIEWS_LOCAL_STORAGE_KEY = 'minReviewsFilter';
    const MIN_RATING_LOCAL_STORAGE_KEY = 'minRatingFilter';

    const FILTERS_BLOCK_WRAP_SELECTOR = '.filters-block__wrap';
    const PRODUCT_CARD_SELECTOR = '.product-card';
    const PRODUCT_CARD_REVIEWS_SELECTOR = '.product-card__count';
    const PRODUCT_CARD_RATING_SELECTOR = '.address-rate-mini';
    const PRODUCT_CARD_PRICE_SELECTOR = '.price__lower-price';

    const PRICE_FILTER_URL_PARAMS_NAME = 'priceU';

    const minReviewsValue = +(localStorage.getItem(MIN_REVIEWS_LOCAL_STORAGE_KEY) ?? MIN_REVIEWS);
    const minRatingValue = +(localStorage.getItem(MIN_RATING_LOCAL_STORAGE_KEY) ?? MIN_RATING);
    let minPriceValue = getMinPriceValueFromURL();

    setTimeout(() => {
        const filtersBlockWrap = document.querySelector(FILTERS_BLOCK_WRAP_SELECTOR);

        if (filtersBlockWrap) {
            const filtersBlockContainer = document.createElement('div');
            filtersBlockContainer.classList.add('filters-block__container');
            filtersBlockContainer.style = 'display: flex;';
            filtersBlockWrap.appendChild(filtersBlockContainer);

            appendFilterControls(filtersBlockContainer);

            setInterval(cleanList, 500);
        }
    }, 1000);

    function cleanList() {
        const productCards = document.querySelectorAll(PRODUCT_CARD_SELECTOR);

        productCards.forEach(
            (productCard) => {
                const productCardReviews = productCard.querySelector(PRODUCT_CARD_REVIEWS_SELECTOR);

                const productCardReviewsText = productCardReviews.innerText;
                const productCardReviewsDigit = +productCardReviewsText.replace(/\D/g, '');

                const productCardRating = productCard.querySelector(PRODUCT_CARD_RATING_SELECTOR);

                const productCardRatingText = productCardRating.innerText;
                const productCardRatingDigit = +productCardRatingText;

                const productCardPrice = productCard.querySelector(PRODUCT_CARD_PRICE_SELECTOR);

                let productCardPriceDigit = 0;

                if (productCardPrice) {
                    const productCardPriceText = productCardPrice.innerText;
                    productCardPriceDigit = +productCardPriceText.replace(/\D/g, '');
                }

                if (productCardReviewsDigit < minReviewsValue
                    || productCardRatingDigit < minRatingValue
                    || productCardPriceDigit < minPriceValue) {
                    productCard.remove();
                }
            },
        );
    }

    function appendFilterControls(filtersBlockContainer) {
        const minDivStyle = 'padding-left: 7px; margin-top: 14px;';

        const minReviewsDiv = document.createElement('div');
        minReviewsDiv.style = minDivStyle;
        minReviewsDiv.textContent = 'Минимально отзывов: ';

        const minReviewsInput = document.createElement('input');
        minReviewsInput.type = 'number';
        minReviewsInput.value = minReviewsValue;
        minReviewsInput.step = '1';
        minReviewsInput.min = '1';
        minReviewsInput.max = '999999';
        minReviewsInput.addEventListener('change', updateMinReviewsInput);
        minReviewsDiv.appendChild(minReviewsInput);

        const minRatingDiv = document.createElement('div');
        minRatingDiv.style = minDivStyle;
        minRatingDiv.textContent = 'Минимальный рейтинг: ';

        const minRatingInput = document.createElement('input');
        minRatingInput.type = 'number';
        minRatingInput.value = minRatingValue;
        minRatingInput.step = '0.1';
        minRatingInput.min = '4.0';
        minRatingInput.max = '5.0';
        minRatingInput.addEventListener('change', updateMinRatingInput);
        minRatingDiv.appendChild(minRatingInput);

        const minPriceDiv = document.createElement('div');
        minPriceDiv.style = minDivStyle;
        minPriceDiv.textContent = `Минимальная цена: ${minPriceValue}`;

        setInterval(checkMinPrice, 1500);

        filtersBlockContainer.appendChild(minReviewsDiv);
        filtersBlockContainer.appendChild(minRatingDiv);
        filtersBlockContainer.appendChild(minPriceDiv);
    }

    function updateMinReviewsInput(e) {
        updateInput(MIN_REVIEWS_LOCAL_STORAGE_KEY, e);
    }

    function updateMinRatingInput(e) {
        updateInput(MIN_RATING_LOCAL_STORAGE_KEY, e);
    }

    function getMinPriceValueFromURL() {
        const params = new URLSearchParams(window.location.search);

        if (!params.has(PRICE_FILTER_URL_PARAMS_NAME)) {
            return 0;
        }

        const priceFilterParams = params.get(PRICE_FILTER_URL_PARAMS_NAME);
        const priceFilterArray = priceFilterParams.split(';');
        minPriceValue = priceFilterArray[0] / 100;

        return minPriceValue;
    }

    function checkMinPrice() {
        const currentMinPriceValue = getMinPriceValueFromURL();

        if (minPriceValue !== currentMinPriceValue) {
            window.location.reload();
        }
    }

    function updateInput(keyName, e) {
        localStorage.setItem(keyName, e.target.value);
        window.location.reload();
    }
}());
