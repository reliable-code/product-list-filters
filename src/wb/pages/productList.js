import { debounce, waitForElement } from '../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../common/filter/manager';
import { StoredInputValue } from '../../common/storage';
import { fnv1aHash32 as getHash } from '../../common/crypto';
import { getURLPathElement } from '../../common/url';
import { createDiv } from '../../common/dom/elementsFactory';
import {
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../../common/filter/compare';
import {
    createEnabledFilterControl,
    createMaxReviewsFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createNameFilterControl,
} from '../../common/filter/controlsFactory';
import { showElement, showHideElement } from '../../common/dom/manipulation';
import {
    getAllElements,
    getFirstElement,
    getFirstElementInnerNumber,
} from '../../common/dom/helpers';

const FILTERS_BLOCK_WRAP_SELECTOR = '.filters-block__wrap';
const PRODUCT_CARD_LIST_SELECTOR = '.product-card-list';
const PRODUCT_CARD_SELECTOR = '.product-card';
const PRODUCT_CARD_NAME_SELECTOR = '.product-card__brand-wrap';
const PRODUCT_CARD_REVIEWS_SELECTOR = '.product-card__count';
const PRODUCT_CARD_RATING_SELECTOR = '.address-rate-mini';
const PRODUCT_CARD_PRICE_SELECTOR = '.price__lower-price';
const PRICE_FILTER_URL_PARAMS_NAME = 'priceU';

const CATEGORY_NAME = getCategoryName();

const nameFilter =
    new StoredInputValue(`${CATEGORY_NAME}-name-filter`, null, cleanList);
const minReviewsFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-reviews-filter`, null, cleanList);
const maxReviewsFilter =
    new StoredInputValue(`${CATEGORY_NAME}-max-reviews-filter`, null, cleanList);
const minRatingFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-rating-filter`, 4.8, cleanList);
const filterEnabled =
    new StoredInputValue(`${CATEGORY_NAME}-filter-enabled`, true, cleanList);

let minPriceValue = getMinPriceValueFromURL();
const minPriceDivTextContent = () => `Минимальная цена: ${minPriceValue}`;

function getCategoryName() {
    const categoryNameElement = getURLPathElement(3);

    let categoryName;

    if (categoryNameElement && categoryNameElement !== 'search.aspx') {
        categoryName = getHash(categoryNameElement);
    } else {
        categoryName = 'common';
    }

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

export function initProductListMods() {
    waitForElement(document, FILTERS_BLOCK_WRAP_SELECTOR)
        .then((filtersBlockWrap) => {
            removeRecentItemsBlock();

            appendFilterControlsIfNeeded(filtersBlockWrap, appendFiltersContainer);

            cleanList();

            const productCardList = getFirstElement(PRODUCT_CARD_LIST_SELECTOR);

            const observer = new MutationObserver(debounce(cleanList, 150));

            observer.observe(productCardList, {
                childList: true,
            });
        });
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
                showElement(productCard);

                return;
            }

            const productCardNameWrap =
                getFirstElement(PRODUCT_CARD_NAME_SELECTOR, productCard);

            const productCardName = productCardNameWrap.innerText;
            productCardNameWrap.title = productCardName;
            productCardNameWrap.style.whiteSpace = 'normal';

            const productCardReviewsNumber =
                getFirstElementInnerNumber(
                    productCard, PRODUCT_CARD_REVIEWS_SELECTOR, true,
                );

            const productCardRatingNumber =
                getFirstElementInnerNumber(
                    productCard, PRODUCT_CARD_RATING_SELECTOR, true, true,
                );

            const productCardPriceNumber =
                getFirstElementInnerNumber(
                    productCard, PRODUCT_CARD_PRICE_SELECTOR, true,
                );

            const conditionToHide =
                isNotMatchTextFilter(productCardName, nameFilter) ||
                isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
                isGreaterThanFilter(productCardReviewsNumber, maxReviewsFilter) ||
                isLessThanFilter(productCardRatingNumber, minRatingFilter) ||
                productCardPriceNumber < minPriceValue;
            showHideElement(productCard, conditionToHide);
        },
    );
}
