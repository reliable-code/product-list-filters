import { addStorageValueListener } from '../../../common/storage/storage';
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
import { hideElement, showElement, updateElementDisplay } from '../../../common/dom/manipulation';
import {
    getAllElements,
    getArrayElementInnerNumber,
    getElementInnerNumber,
    getFirstElement,
} from '../../../common/dom/helpers';
import { getStoredRatingValue, setStoredRatingValue } from '../../db/db';
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

// todo: wrap into init func
const SECTION_ID = getSectionId();

const {
    createGlobalFilter,
    createSectionFilter,
} = createFilterFactory(addProcessProductCardsToQueue, SECTION_ID);

const nameFilter = createSectionFilter('name-filter');
const minReviewsFilter = createSectionFilter('min-reviews-filter');
const maxReviewsFilter = createSectionFilter('max-reviews-filter');
const minRatingFilter = createSectionFilter('min-rating-filter', 4.8);
const noRatingFilter = createSectionFilter('no-rating-filter', false);
const maxPriceFilter = createSectionFilter('max-price-filter');
const filterEnabled = createSectionFilter('filter-enabled', true);
const nameLinesNumber = createGlobalFilter('name-lines-number', 2);
// const rowCardsNumber = createGlobalFilter('row-cards-number', 4);

let processListQueue = Promise.resolve();

function getSectionId() {
    const sectionName = somePathElementEquals('search')
        ? getURLQueryStringParam('text')
        : getURLPathElement(2, '');

    return getHashOrDefault(sectionName);
}

export async function initProductListMods(paginatorContent) {
    const searchResultsSort = await waitForElement(document, COMMON_SELECTORS.SEARCH_RESULTS_SORT);
    appendFilterControlsIfNeeded(searchResultsSort, appendFiltersContainer);

    addStorageValueListener('last-rate-update', addProcessProductCardsToQueue);

    await addProcessProductCardsToQueue();
    const observer = new MutationObserver(debounce(addProcessProductCardsToQueue, 150));

    observer.observe(paginatorContent, {
        childList: true,
        subtree: true,
    });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    addScrollToFiltersButton(parentNode);
    setCommonFiltersContainerStyles(filtersContainer);

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
}

async function addProcessProductCardsToQueue() {
    processListQueue = processListQueue.then(processProductCards);
}

async function processProductCards() {
    const productCards = [...getAllElements(COMMON_SELECTORS.PRODUCT_CARDS)];
    const firstProductCardsWrap = getFirstProductCardsWrap();
    moveProductCardsToFirstWrap(productCards, firstProductCardsWrap);

    await Promise.all(productCards.map(processProductCard));
}

function processProductCard(productCard) {
    if (!filterEnabled.value) {
        showElement(productCard);
        return;
    }

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

    setLineClamp(productCardNameWrap);

    const productCardPriceNumber = getElementInnerNumber(productCardPriceWrap, true);
    const productCardRatingWrap = getFirstElement(SELECTORS.PRODUCT_CARD_RATING_WRAP, productCard);

    const {
        productCardReviewsNumber,
        productCardRatingNumber,
        shouldHideProductCard,
    } = processProductCardRating(productCardRatingWrap, productArticle);

    if (shouldHideProductCard) {
        hideElement(productCard);
        return;
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
}

function setLineClamp(productCardNameWrap) {
    productCardNameWrap.parentNode.style.webkitLineClamp = nameLinesNumber.value;
}

function processProductCardRating(productCardRatingWrap, productArticle) {
    let productCardReviewsNumber;
    let productCardRatingNumber;

    if (!productCardRatingWrap) {
        if (anyRatingFilterHasValue() && !noRatingFilter.value) {
            return { shouldHideProductCard: true };
        }
    } else {
        const productCardRatingWrapSpans = getAllElements(
            ':scope > span', productCardRatingWrap, true,
        );
        productCardReviewsNumber = getArrayElementInnerNumber(
            productCardRatingWrapSpans, 1, true,
        );
        productCardRatingNumber = getProductCardRatingNumber(
            productCardRatingWrapSpans, productArticle,
        );

        appendProductDislikeButtonIfNeeded(productCardRatingWrap, productArticle);
    }

    return {
        productCardReviewsNumber,
        productCardRatingNumber,
        shouldHideProductCard: false,
    };
}

function anyRatingFilterHasValue() {
    return minReviewsFilter.value || maxReviewsFilter.value || minRatingFilter.value;
}

function getProductCardRatingNumber(productCardRatingWrapSpans, productArticle) {
    const storedRatingValue = getStoredRatingValue(productArticle);
    if (!storedRatingValue) {
        return getArrayElementInnerNumber(productCardRatingWrapSpans, 0);
    }

    updateRatingText(productCardRatingWrapSpans, storedRatingValue);

    return storedRatingValue;
}

function updateRatingText(productCardRatingWrapSpans, storedRatingValue) {
    productCardRatingWrapSpans[0].children[1].textContent = storedRatingValue.toString()
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
    await addProcessProductCardsToQueue();
}
