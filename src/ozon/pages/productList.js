import { addStorageValueListener, StoredInputValue } from '../../common/storage/storage';
import { debounce, waitForElement } from '../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../common/filter/manager';
import {
    CHECKBOX_INPUT_STYLE,
    CONTROL_STYLE,
    createDislikeButton,
    getFirstProductCardsWrap,
    getProductArticleFromLink,
    moveProductCardToFirstWrapIfNeeded,
    NUMBER_INPUT_STYLE,
    PRODUCT_CARD_NAME_SELECTOR,
    PRODUCT_CARDS_SELECTOR,
    SEARCH_RESULTS_SORT_SELECTOR,
    setCommonFiltersContainerStyles,
    TEXT_INPUT_STYLE,
} from './common/common';
import { getURLPathElement, getURLQueryStringParam, somePathElementEquals } from '../../common/url';
import {
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../../common/filter/compare';
import { createFilterControlNumber } from '../../common/filter/factories/genericControls';
import { hideElement, showElement, updateElementDisplay } from '../../common/dom/manipulation';
import {
    getAllElements,
    getArrayElementInnerNumber,
    getElementInnerNumber,
    getFirstElement,
    styleStringToObject,
} from '../../common/dom/helpers';
import { fnv1aHash32 as getHash } from '../../common/crypto';
import { getStoredRatingValue, setStoredRatingValue } from '../db/db';
import {
    createEnabledFilterControl,
    createMaxPriceFilterControl,
    createMaxReviewsFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createNameFilterControl,
    createNoRatingFilterControl,
} from '../../common/filter/factories/specificControls';

const PAGINATOR_CONTENT_SELECTOR = '#paginatorContent';
export const paginatorContent = getFirstElement(PAGINATOR_CONTENT_SELECTOR);

const PRODUCT_CARD_PRICE_SELECTOR = '.tsHeadline500Medium';
const PRODUCT_CARD_RATING_WRAP_SELECTOR = '.tsBodyMBold';
const DISLIKE_BUTTON_ADDED_ATTR = 'dislikeButtonAdded';

// todo: wrap into init func
const CATEGORY_NAME = getCategoryName();

const nameFilter =
    new StoredInputValue(`${CATEGORY_NAME}-name-filter`, null, cleanList);
const minReviewsFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-reviews-filter`, null, cleanList);
const maxReviewsFilter =
    new StoredInputValue(`${CATEGORY_NAME}-max-reviews-filter`, null, cleanList);
const minRatingFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-rating-filter`, 4.8, cleanList);
const noRatingFilter =
    new StoredInputValue(`${CATEGORY_NAME}-no-rating-filter`, false, cleanList);
const maxPriceFilter =
    new StoredInputValue(`${CATEGORY_NAME}-max-price-filter`, null, cleanList);
const filterEnabled =
    new StoredInputValue(`${CATEGORY_NAME}-filter-enabled`, true, cleanList);
const nameLinesNumber =
    new StoredInputValue('name-lines-number', 2, cleanList);
// const rowCardsNumber =
//     new StoredInputValue('row-cards-number', 4, cleanList);

function getCategoryName() {
    let categoryName;

    if (somePathElementEquals('search')) {
        const textParam = getURLQueryStringParam('text');
        categoryName = getHashOrDefault(textParam);
    } else {
        const categoryNameElement = getURLPathElement(2, '');

        categoryName = getHashOrDefault(categoryNameElement);
    }

    return categoryName;
}

function getHashOrDefault(value, defaultValue = 'common') {
    return value ? getHash(value) : defaultValue;
}

export function initProductListMods() {
    waitForElement(document, SEARCH_RESULTS_SORT_SELECTOR)
        .then((searchResultsSort) => {
            appendFilterControlsIfNeeded(searchResultsSort, appendFiltersContainer);
            addStorageValueListener('last-rate-update', cleanList);

            cleanList();
            const observer = new MutationObserver(debounce(cleanList, 150));

            observer.observe(paginatorContent, {
                childList: true,
                subtree: true,
            });
        });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    setCommonFiltersContainerStyles(filtersContainer, parentNode);

    const nameFilterDiv =
        createNameFilterControl(nameFilter, styleStringToObject(CONTROL_STYLE), styleStringToObject(TEXT_INPUT_STYLE));

    const minReviewsDiv =
        createMinReviewsFilterControl(minReviewsFilter, styleStringToObject(CONTROL_STYLE), styleStringToObject(NUMBER_INPUT_STYLE));

    const maxReviewsDiv =
        createMaxReviewsFilterControl(maxReviewsFilter, styleStringToObject(CONTROL_STYLE), styleStringToObject(NUMBER_INPUT_STYLE));

    const minRatingDiv =
        createMinRatingFilterControl(minRatingFilter, styleStringToObject(CONTROL_STYLE), styleStringToObject(NUMBER_INPUT_STYLE));

    const noRatingDiv =
        createNoRatingFilterControl(noRatingFilter, styleStringToObject(CONTROL_STYLE), styleStringToObject(CHECKBOX_INPUT_STYLE));

    const maxPriceDiv =
        createMaxPriceFilterControl(maxPriceFilter, CONTROL_STYLE, NUMBER_INPUT_STYLE, '25');

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, styleStringToObject(CONTROL_STYLE), styleStringToObject(CHECKBOX_INPUT_STYLE));

    const nameLinesNumberDiv =
        createFilterControlNumber(
            'Строк: ',
            nameLinesNumber,
            1,
            1,
            10,
            styleStringToObject(CONTROL_STYLE),
            styleStringToObject(NUMBER_INPUT_STYLE),
        );

    filtersContainer.append(
        nameFilterDiv,
        minReviewsDiv,
        maxReviewsDiv,
        minRatingDiv,
        noRatingDiv,
        maxPriceDiv,
        filterEnabledDiv,
        nameLinesNumberDiv,
    );

    parentNode.append(filtersContainer);
}

function cleanList() {
    const productCards = getAllElements(PRODUCT_CARDS_SELECTOR, paginatorContent);

    const productCardsLength = productCards.length;
    warnIfListNotFull(productCardsLength);

    const firstProductCardsWrap = getFirstProductCardsWrap();

    let showCounter = 0;

    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                showElement(productCard);
                showCounter += 1;
                return;
            }

            moveProductCardToFirstWrapIfNeeded(productCard, firstProductCardsWrap);

            const productCardLink =
                getFirstElement('a', productCard);

            if (!productCardLink) {
                hideElement(productCard);
                return;
            }

            const productArticle = getProductArticleFromLink(productCardLink);

            const productCardNameWrap =
                getFirstElement(PRODUCT_CARD_NAME_SELECTOR, productCard);

            const productCardPriceWrap =
                getFirstElement(PRODUCT_CARD_PRICE_SELECTOR, productCard);

            if (!productCardNameWrap || !productCardPriceWrap) {
                hideElement(productCard);
                return;
            }

            productCardNameWrap.parentNode.style.webkitLineClamp = nameLinesNumber.value;

            const productCardPriceNumber =
                getElementInnerNumber(productCardPriceWrap, true);

            const productCardRatingWrap =
                getFirstElement(PRODUCT_CARD_RATING_WRAP_SELECTOR, productCard);

            let productCardReviewsNumber;
            let productCardRatingNumber;

            if (!productCardRatingWrap) {
                const anyRatingFilterHasValue =
                    minReviewsFilter.value || maxReviewsFilter.value || minRatingFilter.value;

                if (anyRatingFilterHasValue && !noRatingFilter.value) {
                    hideElement(productCard);
                    return;
                }
            } else {
                const productCardRatingWrapSpans =
                    getAllElements(':scope > span', productCardRatingWrap, true);

                productCardReviewsNumber =
                    getArrayElementInnerNumber(productCardRatingWrapSpans, 1, true);

                const storedRatingValue = getStoredRatingValue(productArticle);

                if (!storedRatingValue) {
                    productCardRatingNumber =
                        getArrayElementInnerNumber(productCardRatingWrapSpans, 0);
                } else {
                    productCardRatingNumber = storedRatingValue;

                    productCardRatingWrapSpans[0].children[1].textContent =
                        storedRatingValue.toString()
                            .padEnd(5);
                }

                appendProductDislikeButtonIfNeeded(productCardRatingWrap, productArticle);
            }

            const productCardName = productCardNameWrap.innerText;

            productCardNameWrap.title = productCardName;

            const shouldHide =
                isNotMatchTextFilter(productCardName, nameFilter) ||
                isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
                isGreaterThanFilter(productCardReviewsNumber, maxReviewsFilter) ||
                isLessThanFilter(productCardRatingNumber, minRatingFilter) ||
                isGreaterThanFilter(productCardPriceNumber, maxPriceFilter);
            updateElementDisplay(productCard, shouldHide);

            if (!shouldHide) showCounter += 1;
        },
    );

    console.log(`Отображено: ${showCounter} из ${productCardsLength}`);
}

function warnIfListNotFull(productCardsLength, defaultLength = 36) {
    if (productCardsLength === defaultLength || window.location.search.includes('text')) {
        return;
    }

    console.warn(`Озон предоставил ${productCardsLength} позиций из ${defaultLength}`);
}

function appendProductDislikeButtonIfNeeded(productCardRatingWrap, productArticle) {
    if (productCardRatingWrap.hasAttribute(DISLIKE_BUTTON_ADDED_ATTR)) {
        return;
    }

    productCardRatingWrap.style = 'display: flex; width: 100%';

    const dislikeButton =
        createDislikeButton(
            () => dislikeProductOnProductList(productArticle), false,
        );

    productCardRatingWrap.append(dislikeButton);
    productCardRatingWrap.setAttribute(DISLIKE_BUTTON_ADDED_ATTR, '');
}

function dislikeProductOnProductList(productArticle) {
    setStoredRatingValue(productArticle, 1);
    cleanList();
}
