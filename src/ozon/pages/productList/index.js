import { addStorageValueListener } from '../../../common/storage';
import { debounce, waitForElement } from '../../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import {
    addScrollToFiltersButton,
    createDislikeButton,
    getFirstProductCardsWrap,
    getProductArticleFromLink,
    moveProductCardsToFirstWrap,
    setCommonFiltersContainerStyles,
} from '../common';
import {
    getURLPathElement,
    getURLQueryStringParam,
    somePathElementEquals,
} from '../../../common/url';
import {
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../../../common/filter/compare';
import { createNumberFilterControl } from '../../../common/filter/factories/genericControls';
import {
    applyStyles,
    hideElement,
    showElement,
    updateElementDisplay,
} from '../../../common/dom/manipulation';
import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../../../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMaxPriceFilterControl,
    createMaxReviewsFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createNoRatingFilterControl,
    createSearchFilterControl,
} from '../../../common/filter/factories/specificControls';
import { getHashOrDefault } from '../../../common/hash/helpers';
import { STYLES } from '../common/styles';
import { SELECTORS as COMMON_SELECTORS } from '../common/selectors';
import { SELECTORS } from './selectors';
import { ATTRIBUTES } from './attributes';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';
import {
    getStoredRatingValue,
    setStoredRatingValue,
    STORAGE_KEYS,
} from '../../../common/db/specific';

// todo: wrap into init func
const SECTION_ID = getSectionId();

const {
    createGlobalFilter,
    createSectionFilter,
} = createFilterFactory(processProductCards, SECTION_ID);

const nameFilter = createSectionFilter('name-filter');
const minReviewsFilter = createSectionFilter('min-reviews-filter');
const maxReviewsFilter = createSectionFilter('max-reviews-filter');
const minRatingFilter = createSectionFilter('min-rating-filter', 4.8);
const noRatingFilter = createSectionFilter('no-rating-filter', false);
const maxPriceFilter = createSectionFilter('max-price-filter');
const filterEnabled = createSectionFilter('filter-enabled', true);
const nameLinesNumber = createGlobalFilter('name-lines-number', 2);
// const rowCardsNumber = createGlobalFilter('row-cards-number', 4);

const state = {
    firstProductCardsWrap: null,
    productCardsCache: new WeakMap(),
};

function getSectionId() {
    const sectionName = somePathElementEquals('search')
        ? getURLQueryStringParam('text')
        : getURLPathElement(2, '');

    return getHashOrDefault(sectionName);
}

export async function initProductListMods(paginatorContent) {
    const searchResultsSort = await waitForElement(document, COMMON_SELECTORS.SEARCH_RESULTS_SORT);
    appendFilterControlsIfNeeded(searchResultsSort, appendFiltersContainer);

    addStorageValueListener(STORAGE_KEYS.LAST_RATE_UPDATE, processProductCards);

    processProductCards();
    const observer = new MutationObserver(debounce(processProductCards, 150));

    observer.observe(paginatorContent, {
        childList: true,
        subtree: true,
    });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    setCommonFiltersContainerStyles(filtersContainer);
    applyStyles(parentNode, { position: 'relative' });

    const nameFilterDiv = createSearchFilterControl(
        nameFilter, STYLES.CONTROL, STYLES.TEXT_INPUT,
    );
    const minReviewsDiv = createMinReviewsFilterControl(
        minReviewsFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const maxReviewsDiv = createMaxReviewsFilterControl(
        maxReviewsFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const minRatingDiv = createMinRatingFilterControl(
        minRatingFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const noRatingDiv = createNoRatingFilterControl(
        noRatingFilter, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );
    const maxPriceDiv = createMaxPriceFilterControl(
        maxPriceFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );
    const nameLinesNumberDiv = createNumberFilterControl(
        'Строк: ',
        nameLinesNumber,
        1,
        1,
        10,
        STYLES.CONTROL,
        STYLES.NUMBER_INPUT,
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
    addScrollToFiltersButton(parentNode);
}

function processProductCards() {
    const productCards = getAllElements(COMMON_SELECTORS.PRODUCT_CARDS);
    state.firstProductCardsWrap ??= getFirstProductCardsWrap();
    moveProductCardsToFirstWrap(productCards, state.firstProductCardsWrap);
    productCards.forEach(processProductCard);
}

function processProductCard(productCard) {
    if (!filterEnabled.value) {
        showElement(productCard);
        return;
    }

    let cachedData = state.productCardsCache.get(productCard);

    if (!cachedData) {
        const productCardLink = getFirstElement('a', productCard);
        if (!productCardLink) {
            hideElement(productCard);
            return;
        }

        const productArticle = getProductArticleFromLink(productCardLink);
        const productCardNameWrap = getFirstElement(COMMON_SELECTORS.PRODUCT_CARD_NAME, productCard);
        const productCardPriceWrap = getFirstElement(SELECTORS.PRODUCT_CARD_PRICE, productCard);

        if (!productCardNameWrap || !productCardPriceWrap) {
            hideElement(productCard);
            return;
        }

        const productCardPriceNumber = getElementInnerNumber(productCardPriceWrap, true);

        const storedRatingValue = getStoredRatingValue(productArticle);
        const productCardRatingContainer = getFirstElement(
            SELECTORS.PRODUCT_CARD_RATING_CONTAINER, productCard,
        );

        const {
            productCardReviewsWrap,
            productCardRatingWrap,
            productCardReviewsNumber,
            productCardRatingNumber,
            shouldHideProductCard,
        } = processProductCardRating(productCardRatingContainer, storedRatingValue, productArticle);

        if (shouldHideProductCard) {
            hideElement(productCard);
            return;
        }

        const productCardName = productCardNameWrap.innerText;
        productCardNameWrap.title = productCardName;

        cachedData = {
            productArticle,
            productCardRatingWrap,
            productCardNameWrap,
            productCardName,
            productCardReviewsNumber,
            productCardRatingNumber,
            productCardPriceNumber,
            storedRatingValue,
        };

        state.productCardsCache.set(productCard, cachedData);
    }

    setLineClamp(cachedData.productCardNameWrap);

    const shouldHide =
        isNotMatchTextFilter(cachedData.productCardName, nameFilter) ||
        isLessThanFilter(cachedData.productCardReviewsNumber, minReviewsFilter) ||
        isGreaterThanFilter(cachedData.productCardReviewsNumber, maxReviewsFilter) ||
        isLessThanFilter(cachedData.productCardRatingNumber, minRatingFilter) ||
        isGreaterThanFilter(cachedData.productCardPriceNumber, maxPriceFilter);
    updateElementDisplay(productCard, shouldHide);
}

function processProductCardRating(productCardRatingContainer, storedRatingValue, productArticle) {
    let productCardReviewsWrap;
    let productCardRatingWrap;
    let productCardReviewsNumber;
    let productCardRatingNumber;

    if (!productCardRatingContainer) {
        if (anyRatingFilterHasValue() && !noRatingFilter.value) {
            return { shouldHideProductCard: true };
        }
    } else {
        productCardReviewsWrap = getFirstElement(
            ':scope > span:nth-of-type(2)', productCardRatingContainer, true,
        );
        productCardRatingWrap = getFirstElement(
            ':scope > span:nth-of-type(1) > span:nth-of-type(1)', productCardRatingContainer, true,
        );
        productCardReviewsNumber = getElementInnerNumber(
            productCardReviewsWrap, true,
        );
        productCardRatingNumber = getProductCardRatingNumber(
            productCardRatingWrap, storedRatingValue,
        );

        appendProductDislikeButtonIfNeeded(productCardRatingContainer, productArticle);
    }

    return {
        productCardReviewsWrap,
        productCardRatingWrap,
        productCardReviewsNumber,
        productCardRatingNumber,
        shouldHideProductCard: false,
    };
}

function anyRatingFilterHasValue() {
    return minReviewsFilter.value || maxReviewsFilter.value || minRatingFilter.value;
}

function getProductCardRatingNumber(productCardRatingWrap, storedRatingValue) {
    if (!storedRatingValue) {
        return getElementInnerNumber(productCardRatingWrap);
    }

    updateRatingText(productCardRatingWrap, storedRatingValue);

    return storedRatingValue;
}

function updateRatingText(productCardRatingWrap, storedRatingValue) {
    productCardRatingWrap.textContent = storedRatingValue.toString()
        .padEnd(5);
}

function appendProductDislikeButtonIfNeeded(productCardRatingWrap, productArticle) {
    if (productCardRatingWrap.hasAttribute(ATTRIBUTES.DISLIKE_BUTTON_ADDED)) {
        return;
    }

    productCardRatingWrap.style.display = 'flex';
    productCardRatingWrap.style.width = '100%';

    const dislikeButton =
        createDislikeButton(
            () => dislikeProductOnProductList(productArticle), false,
        );

    productCardRatingWrap.append(dislikeButton);
    productCardRatingWrap.setAttribute(ATTRIBUTES.DISLIKE_BUTTON_ADDED, '');
}

async function dislikeProductOnProductList(productArticle) {
    setStoredRatingValue(productArticle, 1);
    processProductCards();
}

function setLineClamp(productCardNameWrap) {
    productCardNameWrap.parentNode.style.webkitLineClamp = nameLinesNumber.value;
}

function checkStoredRatingValue(cachedData) {
    const storedRatingValue = getStoredRatingValue(cachedData.productArticle);
    if (!storedRatingValue) return;

    cachedData.storedRatingValue = storedRatingValue;
    cachedData.productCardRatingNumber = storedRatingValue;
    updateRatingText(cachedData.productCardRatingWrap, storedRatingValue);
}
