import { debounce, waitForElement } from '../../../common/dom/utils';
import {
    addInputSpinnerButtons,
    addScrollToFiltersButton,
    cloneProductCardsToWrap,
    getClonedProductCardsWrap,
    getProductArticleFromLinkHref,
    wrapReviewsWrapContentWithLink,
} from '../common';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import { isNotMatchTextFilter } from '../../../common/filter/compare';
import {
    createCheckboxFilterControl,
    createNumberFilterControl,
} from '../../../common/filter/factories/genericControls';
import {
    assignElementToDisplayGroup,
    handleDisplayGroups,
    initDisplayGroups,
} from '../../../common/dom/manipulation';
import { getAllElements, getFirstElement } from '../../../common/dom/helpers';
import {
    appendPriceHistory,
    determineIfGoodPrice,
    highlightIfGoodPrice,
} from '../../../common/priceHistory/manipulation';
import {
    createEnabledFilterControl,
    createSearchFilterControl,
} from '../../../common/filter/factories/specificControls';
import { SELECTORS as COMMON_SELECTORS } from '../common/selectors';
import { STYLES } from './styles';
import { SELECTORS } from './selectors';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';
import { clearQueryParams } from '../../../common/url';

const { createGlobalFilter } = createFilterFactory(processProductCards);

const onPriceTolerancePercentChange = () => processProductCards(true);

const nameFilter = createGlobalFilter('favorites-name-filter');
const bestPriceFilter = createGlobalFilter('best-price-filter', false);
const priceTolerancePercent = createGlobalFilter('price-tolerance-percent', 3, onPriceTolerancePercentChange);
const filterEnabled = createGlobalFilter('favorites-filter-enabled', true);

const state = {
    clonedProductCardsWrap: null,
    productCardsCache: new WeakMap(),
};

export async function initFavoritesMods() {
    const searchResultsSort = await waitForElement(document, COMMON_SELECTORS.SEARCH_RESULTS_SORT);
    appendFilterControlsIfNeeded(searchResultsSort, appendFiltersContainer);

    await processProductCards();

    const observer = new MutationObserver(debounce(processProductCards));

    const paginator = getFirstElement(SELECTORS.PAGINATOR);
    observer.observe(paginator, {
        childList: true,
        subtree: true,
    });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    addInputSpinnerButtons();
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);

    const nameFilterDiv = createSearchFilterControl(
        nameFilter,
        STYLES.CONTROL,
        STYLES.TEXT_INPUT,
    );
    const bestPriceDiv = createCheckboxFilterControl(
        'Лучшая цена: ',
        bestPriceFilter,
        STYLES.CONTROL,
        STYLES.CHECKBOX_INPUT,
    );
    const priceTolerancePercentDiv = createNumberFilterControl(
        'Допуск цены, %: ',
        priceTolerancePercent,
        1,
        0,
        100,
        STYLES.CONTROL,
        STYLES.NUMBER_INPUT,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled,
        STYLES.CONTROL,
        STYLES.CHECKBOX_INPUT,
    );

    filtersContainer.append(
        nameFilterDiv, bestPriceDiv, priceTolerancePercentDiv, filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
    addScrollToFiltersButton(parentNode);
}

async function processProductCards(priceTolerancePercentChanged = false) {
    const productCards = getAllElements(COMMON_SELECTORS.PRODUCT_CARDS);
    state.clonedProductCardsWrap ??= getClonedProductCardsWrap();
    cloneProductCardsToWrap(productCards, state.clonedProductCardsWrap);

    const clonedProductCards = [...getAllElements(COMMON_SELECTORS.CLONED_PRODUCT_CARDS)];

    const displayGroups = initDisplayGroups();
    await Promise.all(
        clonedProductCards.map(async (productCard) => {
            const shouldHide = await processProductCard(productCard, priceTolerancePercentChanged);
            assignElementToDisplayGroup(shouldHide, displayGroups, productCard);
        }),
    );
    handleDisplayGroups(displayGroups);
}

async function processProductCard(productCard, priceTolerancePercentChanged) {
    if (!filterEnabled.value) return false;

    let cachedData = state.productCardsCache.get(productCard);

    if (!cachedData) {
        const productLink = getFirstElement('a', productCard);
        if (!productLink) return true;

        const productLinkHref = clearQueryParams(productLink.getAttribute('href'));
        const productArticle = getProductArticleFromLinkHref(productLinkHref);

        const nameWrap = getFirstElement(COMMON_SELECTORS.PRODUCT_CARD_NAME_WRAP, productCard);
        const priceWrap = getFirstElement(COMMON_SELECTORS.PRODUCT_CARD_PRICE_WRAP, productCard);

        if (!nameWrap || !priceWrap) return true;

        const priceInfoWrap = priceWrap.parentNode;
        const priceInfoContainer = priceInfoWrap.parentNode;

        const name = nameWrap.innerText;
        nameWrap.title = name;

        cachedData = {
            productArticle,
            priceInfoWrap,
            priceInfoContainer,
            name,
        };

        state.productCardsCache.set(productCard, cachedData);

        await appendStoredPricesIfNeeded(productCard, cachedData);

        const reviewsWrap = getFirstElement(SELECTORS.PRODUCT_CARD_REVIEWS_WRAP, productCard);
        if (reviewsWrap) wrapReviewsWrapContentWithLink(reviewsWrap, productLinkHref);
    } else if (priceTolerancePercentChanged && cachedData.priceData) {
        cachedData.isGoodPrice = determineIfGoodPrice(
            priceTolerancePercent.value, cachedData.priceData,
        );
        highlightIfGoodPrice(cachedData.isGoodPrice, cachedData.priceInfoContainer);
    }

    const isNotMatchBestPriceFilter = bestPriceFilter.value ? !cachedData.isGoodPrice : false;

    return isNotMatchTextFilter(cachedData.name, nameFilter) || isNotMatchBestPriceFilter;
}

async function appendStoredPricesIfNeeded(productCard, cachedData) {
    const additionalInfo = getFirstElement(SELECTORS.ADDITIONAL_INFO, productCard);
    if (additionalInfo?.innerText === 'Нет в наличии') return;

    await appendStoredPrices(cachedData);
}

async function appendStoredPrices(cachedData) {
    const {
        productArticle,
        priceInfoWrap,
        priceInfoContainer,
    } = cachedData;

    const priceSpan = getFirstElement('span', priceInfoWrap);

    cachedData.priceData = await appendPriceHistory(priceInfoWrap, priceSpan, productArticle);
    if (!cachedData.priceData) return;

    priceInfoContainer.style.display = 'block';

    cachedData.isGoodPrice = determineIfGoodPrice(
        priceTolerancePercent.value, cachedData.priceData,
    );
    highlightIfGoodPrice(cachedData.isGoodPrice, priceInfoContainer);
}
