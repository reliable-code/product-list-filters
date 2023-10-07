import {
    appendFilterControlsIfNeeded,
    createDiv,
    createFilterControlNumber,
    getFirstElement,
    getFirstElementInnerNumber,
    hideElement,
    showElement,
    updateValue,
} from '../common/dom';
import { getLocalStorageValueOrDefault } from '../common/storage';

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

const minReviewsValue = getLocalStorageValueOrDefault(MIN_REVIEWS_LOCAL_STORAGE_KEY, MIN_REVIEWS);
const minRatingValue = getLocalStorageValueOrDefault(MIN_RATING_LOCAL_STORAGE_KEY, MIN_RATING);
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

setInterval(initListClean, 100);

function initListClean() {
    const filtersBlockWrap = getFirstElement(document, FILTERS_BLOCK_WRAP_SELECTOR);

    if (filtersBlockWrap) {
        removeRecentItemsBlock();

        appendFilterControlsIfNeeded(filtersBlockWrap, appendFiltersContainer);

        cleanList();
    }
}

function removeRecentItemsBlock() {
    const recentItems = document.querySelector('.j-recent-items');

    if (recentItems) {
        const { parentNode } = recentItems;
        parentNode.remove();
    }
}

function appendFiltersContainer(filtersContainer, parentNode) {
    filtersContainer.style = 'display: flex;';

    const controlStyle = 'padding-left: 7px; margin-top: 14px;';

    const minReviewsDiv =
        createFilterControlNumber('Минимально отзывов: ',
            minReviewsValue,
            '1',
            '1',
            '999999',
            updateMinReviewsInput,
            controlStyle);

    const minRatingDiv =
        createFilterControlNumber('Минимальный рейтинг: ',
            minRatingValue,
            '0.1',
            '4.0',
            '5.0',
            updateMinRatingInput,
            controlStyle);

    const minPriceDiv =
        createDiv(`Минимальная цена: ${minPriceValue}`, controlStyle);

    setInterval(checkMinPrice, 1500);

    filtersContainer.append(minReviewsDiv, minRatingDiv, minPriceDiv);
    parentNode.append(filtersContainer);
}

function updateMinReviewsInput(e) {
    updateValue(e, MIN_REVIEWS_LOCAL_STORAGE_KEY);
}

function updateMinRatingInput(e) {
    updateValue(e, MIN_RATING_LOCAL_STORAGE_KEY);
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
            const productCardReviewsNumber =
                getFirstElementInnerNumber(productCard, PRODUCT_CARD_REVIEWS_SELECTOR, true);

            const productCardRatingNumber =
                getFirstElementInnerNumber(productCard, PRODUCT_CARD_RATING_SELECTOR);

            const productCardPriceNumber =
                getFirstElementInnerNumber(productCard, PRODUCT_CARD_PRICE_SELECTOR, true);

            if (productCardReviewsNumber < minReviewsValue
                || productCardRatingNumber < minRatingValue
                || productCardPriceNumber < minPriceValue) {
                hideElement(productCard);
            } else {
                showElement(productCard);
            }
        },
    );
}
