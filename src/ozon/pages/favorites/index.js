import { debounce, waitForElement } from '../../../common/dom/utils';
import {
    addScrollToFiltersButton,
    getFirstProductCardsWrap,
    getProductArticleFromLink,
    moveProductCardsToFirstWrap,
    setCommonFiltersContainerStyles,
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
import { ATTRIBUTES } from '../../../common/priceHistory/attributes';
import {
    appendPriceHistory,
    checkIfGoodPriceFromAttributes,
} from '../../../common/priceHistory/manipulation';
import {
    createEnabledFilterControl,
    createSearchFilterControl,
} from '../../../common/filter/factories/specificControls';
import { SELECTORS as COMMON_SELECTORS } from '../common/selectors';
import { STYLES } from '../common/styles';
import { SELECTORS } from './selectors';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';

const { createGlobalFilter } = createFilterFactory(processProductCards);

const onPriceTolerancePercentChange = () => processProductCards(true);

const nameFilter = createGlobalFilter('favorites-name-filter');
const bestPriceFilter = createGlobalFilter('best-price-filter', false);
const priceTolerancePercent = createGlobalFilter('price-tolerance-percent', 3, onPriceTolerancePercentChange);
const filterEnabled = createGlobalFilter('favorites-filter-enabled', true);

const state = {
    firstProductCardsWrap: null,
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
    setCommonFiltersContainerStyles(filtersContainer);

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
    const productCards = [...getAllElements(COMMON_SELECTORS.PRODUCT_CARDS)];
    state.firstProductCardsWrap ??= getFirstProductCardsWrap();
    moveProductCardsToFirstWrap(productCards, state.firstProductCardsWrap);

    const displayGroups = initDisplayGroups();
    await Promise.all(
        productCards.map(async (productCard) => {
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
        await appendStoredPricesIfNeeded(productCard);

        const nameWrap = getFirstElement(COMMON_SELECTORS.PRODUCT_CARD_NAME_WRAP, productCard);
        if (!nameWrap) return true;

        const name = nameWrap.innerText;
        nameWrap.title = name;

        cachedData = {
            name,
        };

        state.productCardsCache.set(productCard, cachedData);
    } else if (
        priceTolerancePercentChanged &&
        productCard.hasAttribute(ATTRIBUTES.CURRENT_PRICE) &&
        productCard.hasAttribute(ATTRIBUTES.LOWEST_PRICE)
    ) {
        const priceWrapContainer = getPriceWrap(productCard).parentNode;
        checkIfGoodPriceFromAttributes(priceWrapContainer, productCard, priceTolerancePercent.value);
    }

    const isNotMatchBestPriceFilter =
        bestPriceFilter.value ? !productCard.hasAttribute(ATTRIBUTES.GOOD_PRICE) : false;

    return isNotMatchTextFilter(cachedData.name, nameFilter) || isNotMatchBestPriceFilter;
}

async function appendStoredPricesIfNeeded(productCard) {
    const additionalInfo = getFirstElement(SELECTORS.ADDITIONAL_INFO, productCard);
    if (additionalInfo?.innerText === 'Нет в наличии') return;

    const priceWrap = getPriceWrap(productCard);
    const priceWrapContainer = priceWrap.parentNode;

    await appendStoredPrices(productCard, priceWrap, priceWrapContainer);

    if (productCard.hasAttribute(ATTRIBUTES.CURRENT_PRICE) &&
        productCard.hasAttribute(ATTRIBUTES.LOWEST_PRICE)) {
        checkIfGoodPriceFromAttributes(priceWrapContainer, productCard, priceTolerancePercent.value);
    }
}

function getPriceWrap(productCard) {
    return productCard?.children[0]?.children[1]?.children[0]?.children[0] || null;
}

async function appendStoredPrices(productCard, priceContainer, priceContainerWrap) {
    const productCardLink = getFirstElement('a', productCard);
    if (!productCardLink) return;

    const productArticle = getProductArticleFromLink(productCardLink);
    const priceSpan = getFirstElement('span', priceContainer);

    const priceData = await appendPriceHistory(priceContainer, priceSpan, productArticle);

    if (!priceData) return;

    productCard.setAttribute(ATTRIBUTES.CURRENT_PRICE, priceData.current);
    productCard.setAttribute(ATTRIBUTES.LOWEST_PRICE, priceData.lowest);
    priceContainerWrap.style.display = 'block';
}
