// ==UserScript==
// @name         Yamarket List Clean
// @namespace    https://github.com/reliable-code/product-list-filters
// @version      0.2
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

    setInterval(cleanList, 500);

    function cleanList() {
        const virtuosoScroller = document.querySelector(VIRTUOSO_SCROLLER_SELECTOR);
        if (virtuosoScroller) virtuosoScroller.style.minHeight = '0';

        const productCardSnippets = document.querySelectorAll(PRODUCT_CARD_SNIPPET_SELECTOR);

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
                    removeProductCard(productCard);

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
                    removeProductCard(productCard);
                }
            },
        );
    }

    function removeProductCard(productCard) {
        const { parentNode } = productCard;

        productCard.remove();

        if (!parentNode.childNodes.length) {
            parentNode.parentNode.remove();
        }
    }
}());
