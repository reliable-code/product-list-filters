import { debounce, waitForElement } from '../../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import { getHashOrDefault } from '../../../common/hash/helpers';
import { getURLPathElement, getURLQueryParam, somePathElementEquals } from '../../../common/url';
import {
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../../../common/filter/compare';
import {
    applyStyles,
    assignElementToDisplayGroup,
    handleDisplayGroups,
    initDisplayGroups,
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
    createMinPriceFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createSearchFilterControl,
} from '../../../common/filter/factories/specificControls';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';
import { SELECTORS } from './selectors';
import { STYLES } from '../common/styles';
import { createSeparator } from '../../../common/filter/factories/helpers';
import { getStoredRatingValue } from '../../../common/db/specific';
import { getProductArticleFromLink } from '../common';

const SECTION_ID = getSectionId();

const { createSectionFilter } = createFilterFactory(processProductCards, SECTION_ID);

const nameFilter = createSectionFilter('name-filter');
const minReviewsFilter = createSectionFilter('min-reviews-filter');
const maxReviewsFilter = createSectionFilter('max-reviews-filter');
const minRatingFilter = createSectionFilter('min-rating-filter', 4.8);
const minPriceFilter = createSectionFilter('min-price-filter');
const maxPriceFilter = createSectionFilter('max-price-filter');
const filterEnabled = createSectionFilter('filter-enabled', true);

const state = {
    productCardsCache: new WeakMap(),
};

function getSectionId() {
    const sectionName = somePathElementEquals('search.aspx')
        ? getURLQueryParam('search')
        : getURLPathElement(getSectionPosition(), '');

    return getHashOrDefault(sectionName);
}

function getSectionPosition() {
    return somePathElementEquals('brands') ? 2 : 3;
}

export async function initProductListMods() {
    const filtersBlockWrap = await waitForElement(document, SELECTORS.FILTERS_BLOCK_WRAP);
    appendFilterControlsIfNeeded(filtersBlockWrap, appendFiltersContainer);

    processProductCards();
    const productCardList = getFirstElement(SELECTORS.PRODUCT_CARD_LIST);
    const observer = new MutationObserver(debounce(processProductCards, 150));
    observer.observe(productCardList, {
        childList: true,
    });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);
    filtersContainer.classList.add('input-search');

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
    const minPriceDiv = createMinPriceFilterControl(
        minPriceFilter, STYLES.CONTROL, STYLES.PRICE_INPUT,
    );
    const maxPriceDiv = createMaxPriceFilterControl(
        maxPriceFilter, STYLES.CONTROL, STYLES.PRICE_INPUT,
    );
    const separatorDiv = createSeparator(
        STYLES.CONTROL,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );

    filtersContainer.append(
        nameFilterDiv,
        minReviewsDiv,
        maxReviewsDiv,
        minRatingDiv,
        minPriceDiv,
        maxPriceDiv,
        separatorDiv,
        filterEnabledDiv,
    );
    parentNode.append(filtersContainer);
}

function processProductCards() {
    const productCards = getAllElements(SELECTORS.PRODUCT_CARD);

    const displayGroups = initDisplayGroups();
    productCards.forEach((productCard) => {
        const shouldHide = processProductCard(productCard);
        assignElementToDisplayGroup(shouldHide, displayGroups, productCard);
    });
    handleDisplayGroups(displayGroups);
}

function processProductCard(productCard) {
    if (!filterEnabled.value) return false;

    let cachedData = state.productCardsCache.get(productCard);

    if (!cachedData) {
        const nameWrap = getFirstElement(SELECTORS.PRODUCT_CARD_NAME_WRAP, productCard);
        const priceWrap = getFirstElement(SELECTORS.PRODUCT_CARD_PRICE_WRAP, productCard);

        if (!nameWrap || !priceWrap) return true;

        const reviewsWrap = getFirstElement(SELECTORS.PRODUCT_CARD_REVIEWS_WRAP, productCard);

        const name = nameWrap.innerText;
        nameWrap.title = name;
        nameWrap.style.whiteSpace = 'normal';

        const reviewsCount = getElementInnerNumber(reviewsWrap, true, false, 0);
        const rating = getProductCardRating(productCard);
        const price = getElementInnerNumber(priceWrap, true);

        cachedData = {
            name,
            reviewsCount,
            rating,
            price,
        };

        state.productCardsCache.set(productCard, cachedData);
    }

    return (
        isNotMatchTextFilter(cachedData.name, nameFilter) ||
        isLessThanFilter(cachedData.reviewsCount, minReviewsFilter) ||
        isGreaterThanFilter(cachedData.reviewsCount, maxReviewsFilter) ||
        isLessThanFilter(cachedData.rating, minRatingFilter) ||
        isLessThanFilter(cachedData.price, minPriceFilter) ||
        isGreaterThanFilter(cachedData.price, maxPriceFilter)
    );
}

function getProductCardRating(productCard) {
    const ratingWrap = getFirstElement(SELECTORS.PRODUCT_CARD_RATING_WRAP, productCard);

    const productArticle = getProductArticle(productCard);
    const storedRating = getStoredRatingValue(productArticle);
    if (!storedRating) {
        return getElementInnerNumber(ratingWrap, true, true);
    }

    updateRatingText(ratingWrap, storedRating);

    return storedRating;
}

function getProductArticle(productCard) {
    const productLink = getFirstElement('a', productCard);
    return getProductArticleFromLink(productLink);
}

function updateRatingText(productCardRatingWrap, storedRatingValue) {
    productCardRatingWrap.textContent = storedRatingValue.toString()
        .replace('.', ',');
}
