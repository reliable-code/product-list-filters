import {
    createDiv,
    getAllElements,
    getFirstElement,
    getFirstElementInnerNumber,
    showElement,
    showHideElement,
    waitForElement,
} from '../common/dom';
import { StoredInputValue } from '../common/localstorage';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMaxReviewsFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createNameFilterControl,
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../common/filter';

const FILTERS_BLOCK_WRAP_SELECTOR = '.filters-block__wrap';
const PRODUCT_CARD_SELECTOR = '.product-card';
const PRODUCT_CARD_NAME_SELECTOR = '.product-card__brand-wrap';
const PRODUCT_CARD_REVIEWS_SELECTOR = '.product-card__count';
const PRODUCT_CARD_RATING_SELECTOR = '.address-rate-mini';
const PRODUCT_CARD_PRICE_SELECTOR = '.price__lower-price';

const PRICE_FILTER_URL_PARAMS_NAME = 'priceU';

const CATEGORY_NAME = getCategoryName();

const nameFilter =
    new StoredInputValue(`${CATEGORY_NAME}-name-filter`);
const minReviewsFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-reviews-filter`);
const maxReviewsFilter =
    new StoredInputValue(`${CATEGORY_NAME}-max-reviews-filter`);
const minRatingFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-rating-filter`, 4.8);
const filterEnabled =
    new StoredInputValue(`${CATEGORY_NAME}-filter-enabled`, true);

let minPriceValue = getMinPriceValueFromURL();

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

// initPaginationObserver();

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
        'margin-left: 4px;';
    const textInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 180px;';
    const numberInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 60px;';
    const checkboxInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 22px;' +
        'height: 22px;';

    const nameFilterDiv =
        createNameFilterControl(nameFilter, controlStyle, textInputStyle);

    const minReviewsDiv =
        createMinReviewsFilterControl(minReviewsFilter, controlStyle, numberInputStyle);

    const maxReviewsDiv =
        createMaxReviewsFilterControl(maxReviewsFilter, controlStyle, numberInputStyle);

    const minRatingDiv =
        createMinRatingFilterControl(minRatingFilter, controlStyle, numberInputStyle);

    const minPriceDiv =
        createDiv(minPriceDivTextContent(), priceControlStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    setInterval(() => checkMinPrice(minPriceDiv), 500);

    filtersContainer.append(
        nameFilterDiv, minReviewsDiv, maxReviewsDiv, minRatingDiv, minPriceDiv, filterEnabledDiv,
    );
    parentNode.append(filtersContainer);
}

function checkMinPrice(minPriceDiv) {
    const currentMinPriceValue = getMinPriceValueFromURL();

    if (minPriceValue !== currentMinPriceValue) {
        minPriceValue = currentMinPriceValue;
        minPriceDiv.textContent = minPriceDivTextContent();
    }
}

function initPaginationObserver() {
    waitForElement(document, '.pagination', 10000)
        .then((pagination) => {
            const observer = new MutationObserver(() => updatePaginationCopy(pagination));

            observer.observe(pagination, {
                childList: true,
                subtree: true,
            });
        });
}

function updatePaginationCopy(pagination) {
    let paginationCopy = getFirstElement('.paginationCopy');

    if (paginationCopy) paginationCopy.remove();

    paginationCopy = pagination.cloneNode(true);
    paginationCopy.classList.add('paginationCopy');
    paginationCopy.style.margin = '-15px 0 20px';

    const productList = getFirstElement('.catalog-page__main');
    productList.parentNode.insertBefore(paginationCopy, productList);
}

function cleanList() {
    const productCards = getAllElements(PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                showElement(productCard, 'block');

                return;
            }

            const productCardNameWrap =
                getFirstElement(PRODUCT_CARD_NAME_SELECTOR, productCard);

            const productCardName = productCardNameWrap.innerText;

            const productCardReviewsNumber =
                getFirstElementInnerNumber(productCard, PRODUCT_CARD_REVIEWS_SELECTOR, true);

            const productCardRatingNumber =
                getFirstElementInnerNumber(productCard, PRODUCT_CARD_RATING_SELECTOR);

            const productCardPriceNumber =
                getFirstElementInnerNumber(productCard, PRODUCT_CARD_PRICE_SELECTOR, true);

            const conditionToHide =
                isNotMatchTextFilter(productCardName, nameFilter) ||
                isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
                isGreaterThanFilter(productCardReviewsNumber, maxReviewsFilter) ||
                isLessThanFilter(productCardRatingNumber, minRatingFilter) ||
                productCardPriceNumber < minPriceValue;
            showHideElement(productCard, conditionToHide, 'block');
        },
    );
}
