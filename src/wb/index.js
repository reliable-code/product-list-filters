import {
    createDiv,
    getAllElements,
    getFirstElement,
    getFirstElementInnerNumber,
    showElement,
    showHideElement,
} from '../common/dom';
import { getStorageValueOrDefault, setStorageValueFromEvent } from '../common/storage';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
} from '../common/filter';

const MIN_REVIEWS = 50;
const MIN_RATING = 4.8;
const FILTER_ENABLED = true;

const CATEGORY_NAME = getCategoryName();
const MIN_REVIEWS_STORAGE_KEY = `${CATEGORY_NAME}-min-reviews-filter`;
const MIN_RATING_STORAGE_KEY = `${CATEGORY_NAME}-min-rating-filter`;
const FILTER_ENABLED_STORAGE_KEY = `${CATEGORY_NAME}-filter-enabled`;

const FILTERS_BLOCK_WRAP_SELECTOR = '.filters-block__wrap';
const PRODUCT_CARD_SELECTOR = '.product-card';
const PRODUCT_CARD_REVIEWS_SELECTOR = '.product-card__count';
const PRODUCT_CARD_RATING_SELECTOR = '.address-rate-mini';
const PRODUCT_CARD_PRICE_SELECTOR = '.price__lower-price';

const PRICE_FILTER_URL_PARAMS_NAME = 'priceU';

let minReviewsValue = getStorageValueOrDefault(MIN_REVIEWS_STORAGE_KEY, MIN_REVIEWS);
let minRatingValue = getStorageValueOrDefault(MIN_RATING_STORAGE_KEY, MIN_RATING);
let minPriceValue = getMinPriceValueFromURL();
let filterEnabledChecked = getStorageValueOrDefault(FILTER_ENABLED_STORAGE_KEY, FILTER_ENABLED);

const minPriceDivTextContent = () => `Минимальная цена: ${minPriceValue}`;

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
    const filtersBlockWrap = getFirstElement(FILTERS_BLOCK_WRAP_SELECTOR);

    if (filtersBlockWrap) {
        removeRecentItemsBlock();

        appendFilterControlsIfNeeded(filtersBlockWrap, appendFiltersContainer);

        cleanList();
    }
}

function removeRecentItemsBlock() {
    const recentItems = getFirstElement('.j-recent-items');

    if (recentItems) {
        const { parentNode } = recentItems;
        parentNode.remove();
    }
}

function appendFiltersContainer(filtersContainer, parentNode) {
    filtersContainer.style =
        'display: flex;' +
        'grid-gap: 15px;' +
        'margin-top: 14px;';

    const controlStyle =
        'display: flex;' +
        'align-items: center;';
    const priceControlStyle =
        controlStyle + // eslint-disable-line prefer-template
        'margin-right: 37px;';
    const inputStyle =
        'margin: 0px 4px;';
    const numberInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 55px;';
    const checkboxInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 22px;' +
        'height: 22px;';

    const minReviewsDiv =
        createMinReviewsFilterControl(
            minReviewsValue, updateMinReviewsValue, controlStyle, numberInputStyle,
        );

    const minRatingDiv =
        createMinRatingFilterControl(
            minRatingValue, updateMinRatingValue, controlStyle, numberInputStyle,
        );

    const minPriceDiv =
        createDiv(
            minPriceDivTextContent(), priceControlStyle,
        );

    const filterEnabledDiv =
        createEnabledFilterControl(
            filterEnabledChecked, updateFilterEnabledValue, controlStyle, checkboxInputStyle,
        );

    setInterval(() => checkMinPrice(minPriceDiv), 500);

    filtersContainer.append(minReviewsDiv, minRatingDiv, minPriceDiv, filterEnabledDiv);
    parentNode.append(filtersContainer);
}

function updateMinReviewsValue(e) {
    minReviewsValue = setStorageValueFromEvent(e, MIN_REVIEWS_STORAGE_KEY);
}

function updateMinRatingValue(e) {
    minRatingValue = setStorageValueFromEvent(e, MIN_RATING_STORAGE_KEY);
}

function updateFilterEnabledValue(e) {
    filterEnabledChecked = setStorageValueFromEvent(e, FILTER_ENABLED_STORAGE_KEY);
}

function checkMinPrice(minPriceDiv) {
    const currentMinPriceValue = getMinPriceValueFromURL();

    if (minPriceValue !== currentMinPriceValue) {
        minPriceValue = currentMinPriceValue;
        minPriceDiv.textContent = minPriceDivTextContent();
    }
}

function cleanList() {
    const productCards = getAllElements(PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
            if (!filterEnabledChecked) {
                showElement(productCard);

                return;
            }

            const productCardReviewsNumber =
                getFirstElementInnerNumber(productCard, PRODUCT_CARD_REVIEWS_SELECTOR, true);

            const productCardRatingNumber =
                getFirstElementInnerNumber(productCard, PRODUCT_CARD_RATING_SELECTOR);

            const productCardPriceNumber =
                getFirstElementInnerNumber(productCard, PRODUCT_CARD_PRICE_SELECTOR, true);

            const conditionToHide =
                productCardReviewsNumber < minReviewsValue ||
                productCardRatingNumber < minRatingValue ||
                productCardPriceNumber < minPriceValue;
            showHideElement(productCard, conditionToHide);
        },
    );
}
