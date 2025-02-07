import { addStorageValueListener } from '../../../common/storage';
import { debounce, waitForElement } from '../../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import {
    addScrollToFiltersButton,
    cloneProductCardsToWrap,
    createDislikeButton,
    getClonedProductCardsWrap,
    getProductArticleFromLinkHref,
    setCommonFiltersContainerStyles,
    wrapReviewsWrapContentWithLink,
} from '../common';
import {
    clearQueryParams,
    getURLPathElement,
    getURLQueryParam,
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
    createCardsPerRowControl,
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
import { SELECTORS } from '../common/selectors';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';
import { getStoredRating, setStoredRating, STORAGE_KEYS } from '../../../common/db/specific';

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
const cardsPerRow = createGlobalFilter('cards-per-row', 4);
const maxNameLines = createGlobalFilter('max-name-lines', 2);

const state = {
    clonedProductCardsWrap: null,
    productCardsCache: new WeakMap(),
};

function getSectionId() {
    const sectionName = somePathElementEquals('search')
        ? getURLQueryParam('text')
        : getURLPathElement(2, '');

    return getHashOrDefault(sectionName);
}

export async function initProductListMods(paginator) {
    const searchResultsSort = await waitForElement(document, SELECTORS.SEARCH_RESULTS_SORT);
    appendFilterControlsIfNeeded(searchResultsSort, appendFiltersContainer);

    addStorageValueListener(STORAGE_KEYS.LAST_RATE_UPDATE, () => processProductCards(true));

    processProductCards();
    const observer = new MutationObserver(debounce(() => processProductCards(), 150));

    observer.observe(paginator, {
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
    const cardsPerRowDiv = createCardsPerRowControl(
        cardsPerRow, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const maxNameLinesDiv = createNumberFilterControl(
        'Строк имени: ',
        maxNameLines,
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
        cardsPerRowDiv,
        maxNameLinesDiv,
    );

    parentNode.append(filtersContainer);
    addScrollToFiltersButton(parentNode);
}

function processProductCards(rateUpdated = false) {
    const productCards = getAllElements(SELECTORS.PRODUCT_CARDS);
    state.clonedProductCardsWrap ??= getClonedProductCardsWrap();
    cloneProductCardsToWrap(productCards, state.clonedProductCardsWrap);

    const clonedProductCards = getAllElements(SELECTORS.CLONED_PRODUCT_CARDS);
    setGridColumns();

    const displayGroups = initDisplayGroups();
    clonedProductCards.forEach((productCard) => {
        const shouldHide = processProductCard(productCard, rateUpdated);
        assignElementToDisplayGroup(shouldHide, displayGroups, productCard);
    });
    handleDisplayGroups(displayGroups);
}

function processProductCard(productCard, rateUpdated) {
    if (!filterEnabled.value) return false;

    let cachedData = state.productCardsCache.get(productCard);

    if (!cachedData) {
        const productLink = getFirstElement('a', productCard);
        if (!productLink) return true;

        const productLinkHref = clearQueryParams(productLink.getAttribute('href'));
        const productArticle = getProductArticleFromLinkHref(productLinkHref);
        const nameWrap = getFirstElement(SELECTORS.PRODUCT_CARD_NAME_WRAP, productCard);
        const priceWrap = getFirstElement(SELECTORS.PRODUCT_CARD_PRICE_WRAP, productCard);

        if (!nameWrap || !priceWrap) return true;

        const ratingContainer = getFirstElement(
            SELECTORS.PRODUCT_CARD_RATING_CONTAINER, productCard,
        );

        const {
            ratingWrap,
            reviewsCount,
            rating,
            storedRating,
            noRatingContainer,
        } = processProductCardRating(ratingContainer, productLinkHref, productArticle);

        const name = nameWrap.innerText;
        nameWrap.title = name;

        const price = getElementInnerNumber(priceWrap, true);

        cachedData = {
            productArticle,
            nameWrap,
            name,
            price,
            ratingWrap,
            reviewsCount,
            rating,
            storedRating,
            noRatingContainer,
        };

        state.productCardsCache.set(productCard, cachedData);
    } else if (rateUpdated) {
        checkStoredRating(cachedData);
    }

    setLineClamp(cachedData.nameWrap);

    if (shouldHideByNoRating(cachedData)) return true;

    return (
        isNotMatchTextFilter(cachedData.name, nameFilter) ||
        isLessThanFilter(cachedData.reviewsCount, minReviewsFilter) ||
        isGreaterThanFilter(cachedData.reviewsCount, maxReviewsFilter) ||
        isLessThanFilter(cachedData.rating, minRatingFilter) ||
        isGreaterThanFilter(cachedData.price, maxPriceFilter)
    );
}

function processProductCardRating(ratingContainer, productLinkHref, productArticle) {
    if (!ratingContainer) return { noRatingContainer: true };

    const storedRating = getStoredRating(productArticle);
    const reviewsWrap = getFirstElement(SELECTORS.PRODUCT_CARD_REVIEWS_WRAP, ratingContainer, true);
    const ratingWrap = getFirstElement(SELECTORS.PRODUCT_CARD_RATING_WRAP, ratingContainer, true);

    const reviewsCount = getElementInnerNumber(reviewsWrap, true);
    const rating = getProductCardRating(ratingWrap, storedRating);

    wrapReviewsWrapContentWithLink(reviewsWrap, productLinkHref);
    appendProductDislikeButton(ratingContainer, productArticle);

    return {
        ratingWrap,
        reviewsCount,
        rating,
        storedRating,
        noRatingContainer: false,
    };
}

function anyRatingFilterHasValue() {
    return minReviewsFilter.value || maxReviewsFilter.value || minRatingFilter.value;
}

function getProductCardRating(ratingWrap, storedRating) {
    if (!storedRating) {
        return getElementInnerNumber(ratingWrap);
    }

    updateRatingText(ratingWrap, storedRating);

    return storedRating;
}

function updateRatingText(ratingWrap, storedRating) {
    ratingWrap.textContent = storedRating.toString()
        .padEnd(5);
}

function appendProductDislikeButton(ratingContainer, productArticle) {
    ratingContainer.style.display = 'flex';
    ratingContainer.style.width = '100%';

    const dislikeButton =
        createDislikeButton(
            () => dislikeProductOnProductList(productArticle), false,
        );

    ratingContainer.append(dislikeButton);
}

async function dislikeProductOnProductList(productArticle) {
    setStoredRating(productArticle, 1);
    processProductCards(true);
}

function setLineClamp(nameWrap) {
    nameWrap.parentNode.style.webkitLineClamp = maxNameLines.value;
}

function setGridColumns() {
    state.clonedProductCardsWrap.style.gridTemplateColumns = `repeat(${cardsPerRow.value * 3}, 1fr)`;
}

function shouldHideByNoRating(cachedData) {
    return cachedData.noRatingContainer && anyRatingFilterHasValue() && !noRatingFilter.value;
}

function checkStoredRating(cachedData) {
    const storedRating = getStoredRating(cachedData.productArticle);
    if (!storedRating) return;

    cachedData.storedRating = storedRating;
    cachedData.rating = storedRating;
    updateRatingText(cachedData.ratingWrap, storedRating);
}
