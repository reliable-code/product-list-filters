// ==UserScript==
// @name         Yamarket List Clean
// @namespace    https://github.com/reliable-code/product-list-filters
// @version      0.3
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

    const SEARCH_WRAP_SELECTOR = '[data-grabber="SearchSerp"]';
    const SEARCH_CONTROLS_SELECTOR = '[data-apiary-widget-name="@marketplace/SearchControls"]';
    const VIRTUOSO_SCROLLER_SELECTOR = '[data-virtuoso-scroller="true"]';
    const PRODUCT_CARD_SNIPPET_SELECTOR = '[data-autotest-id="product-snippet"]';
    const PRODUCT_CARD_PARENT_ATTRIBUTE = 'data-apiary-widget-name';

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

    const searchWrap = document.querySelector(SEARCH_WRAP_SELECTOR);

    if (searchWrap) {
        const searchControls =
            document.querySelector(SEARCH_CONTROLS_SELECTOR);

        if (searchControls) appendFilterControls(searchControls);

        setInterval(cleanList, 500);
    }

    function appendFilterControls(searchControls) {
        const filterControls = document.createElement('div');
        filterControls.style = 'display: flex; gap: 10px;';

        const controlStyle = '';

        const minReviewsDiv =
            createFilterControl(
                controlStyle, 'Минимально отзывов: ', minReviewsValue, '1', '1', '999999', updateMinReviewsInput,
            );

        const minRatingDiv =
            createFilterControl(
                controlStyle, 'Минимальный рейтинг: ', minRatingValue, '0.1', '4.0', '5.0', updateMinRatingInput,
            );

        filterControls.appendChild(minReviewsDiv);
        filterControls.appendChild(minRatingDiv);

        const searchControlsParent = searchControls.parentNode;
        searchControlsParent.insertBefore(filterControls, searchControls.nextSibling);
    }

    function createFilterControl(
        controlStyle, titleText, inputValue, inputStep, inputMinValue, inputMaxValue, inputOnChange,
    ) {
        const filterControl = document.createElement('div');
        filterControl.style = controlStyle;
        filterControl.textContent = titleText;

        const input = document.createElement('input');
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
        const virtuosoScroller = searchWrap.querySelector(VIRTUOSO_SCROLLER_SELECTOR);
        if (virtuosoScroller) virtuosoScroller.style.minHeight = '0';

        const productCardSnippets = searchWrap.querySelectorAll(PRODUCT_CARD_SNIPPET_SELECTOR);

        productCardSnippets.forEach(
            (productCardSnippet) => {
                const productCardSnippetParent = productCardSnippet.parentNode;

                const isFirstLoad =
                    productCardSnippetParent.hasAttribute(PRODUCT_CARD_PARENT_ATTRIBUTE);

                const productCard = isFirstLoad
                    ? productCardSnippetParent.parentNode.parentNode
                    : productCardSnippetParent;

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
