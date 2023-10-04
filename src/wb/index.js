import { createFilterControlNumber, getElementInnerNumber, updateInput } from '../common/dom';

const MIN_REVIEWS = 50;
const MIN_RATING = 4.8;

const CATEGORY_NAME = getCategoryName();
const MIN_REVIEWS_LOCAL_STORAGE_KEY = `${CATEGORY_NAME}-min-reviews-filter`;
const MIN_RATING_LOCAL_STORAGE_KEY = `${CATEGORY_NAME}-min-rating-filter`;

const FILTERS_BLOCK_WRAP_SELECTOR = '.filters-block__wrap';
const PRODUCT_CARD_SELECTOR = '.product-card';
const PRODUCT_CARD_REVIEWS_SELECTOR = '.product-card__count';
const PRODUCT_CARD_RATING_SELECTOR = '.address-rate-mini';
const PRODUCT_CARD_PRICE_SELECTOR = '.price__lower-price';

const PRICE_FILTER_URL_PARAMS_NAME = 'priceU';

const minReviewsValue = +(localStorage.getItem(MIN_REVIEWS_LOCAL_STORAGE_KEY) ?? MIN_REVIEWS);
const minRatingValue = +(localStorage.getItem(MIN_RATING_LOCAL_STORAGE_KEY) ?? MIN_RATING);
const minPriceValue = getMinPriceValueFromURL();

function getCategoryName() {
    const { pathname } = window.location;
    const pathElements = pathname.split('/');
    const lastPathElement = pathElements.pop();
    const categoryName = lastPathElement || 'common';

    return categoryName;
}

function getMinPriceValueFromURL() {
    const params = new URLSearchParams(window.location.search);

    if (!params.has(PRICE_FILTER_URL_PARAMS_NAME)) {
        return 0;
    }

    const priceFilterParams = params.get(PRICE_FILTER_URL_PARAMS_NAME);
    const priceFilterParamsArray = priceFilterParams.split(';');
    const minPriceFilterParam = priceFilterParamsArray[0];
    const minPriceFilterValue = minPriceFilterParam / 100;

    return minPriceFilterValue;
}

setTimeout(() => {
    const filtersBlockWrap = document.querySelector(FILTERS_BLOCK_WRAP_SELECTOR);

    if (filtersBlockWrap) {
        removeRecentItemsBlock();

        const filtersBlockContainer = document.createElement('div');
        filtersBlockContainer.classList.add('filters-block__container');
        filtersBlockContainer.style = 'display: flex;';
        filtersBlockWrap.append(filtersBlockContainer);

        appendFilterControls(filtersBlockContainer);

        setInterval(cleanList, 500);
    }
}, 1000);

function removeRecentItemsBlock() {
    const recentItems = document.querySelector('.j-recent-items');

    if (recentItems) {
        const { parentNode } = recentItems;
        parentNode.remove();
    }
}

function appendFilterControls(filtersBlockContainer) {
    const controlStyle = 'padding-left: 7px; margin-top: 14px;';

    const minReviewsDiv =
        createFilterControlNumber('Минимально отзывов: ', minReviewsValue, '1', '1', '999999', updateMinReviewsInput, controlStyle);

    const minRatingDiv =
        createFilterControlNumber('Минимальный рейтинг: ', minRatingValue, '0.1', '4.0', '5.0', updateMinRatingInput, controlStyle);

    const minPriceDiv = document.createElement('div');
    minPriceDiv.style = controlStyle;
    minPriceDiv.textContent = `Минимальная цена: ${minPriceValue}`;

    setInterval(checkMinPrice, 1500);

    filtersBlockContainer.append(minReviewsDiv, minRatingDiv, minPriceDiv);
}

function updateMinReviewsInput(e) {
    updateInput(MIN_REVIEWS_LOCAL_STORAGE_KEY, e);
}

function updateMinRatingInput(e) {
    updateInput(MIN_RATING_LOCAL_STORAGE_KEY, e);
}

function checkMinPrice() {
    const currentMinPriceValue = getMinPriceValueFromURL();

    if (minPriceValue !== currentMinPriceValue) {
        window.location.reload();
    }
}

function cleanList() {
    const productCards = document.querySelectorAll(PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
            const productCardReviews = productCard.querySelector(PRODUCT_CARD_REVIEWS_SELECTOR);
            const productCardReviewsNumber = getElementInnerNumber(productCardReviews, true);

            const productCardRating = productCard.querySelector(PRODUCT_CARD_RATING_SELECTOR);
            const productCardRatingNumber = getElementInnerNumber(productCardRating);

            const productCardPrice = productCard.querySelector(PRODUCT_CARD_PRICE_SELECTOR);
            const productCardPriceNumber = getElementInnerNumber(productCardPrice, true);

            if (productCardReviewsNumber < minReviewsValue
                || productCardRatingNumber < minRatingValue
                || productCardPriceNumber < minPriceValue) {
                productCard.remove();
            }
        },
    );
}
