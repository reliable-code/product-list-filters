import { debounce, waitForElement } from '../../../common/dom/utils';
import { getPriceSpan, getProductArticleFromLink } from '../common';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import { isNotMatchTextFilter } from '../../../common/filter/compare';
import {
    createCheckboxFilterControl,
    createNumberFilterControl,
} from '../../../common/filter/factories/genericControls';
import {
    applyStyles,
    assignElementToDisplayGroup,
    handleDisplayGroups,
    initDisplayGroups,
} from '../../../common/dom/manipulation';
import { getAllElements, getFirstElement } from '../../../common/dom/helpers';
import {
    appendPriceHistory,
    checkIfGoodPriceFromAttributes,
} from '../../../common/priceHistory/manipulation';
import {
    createEnabledFilterControl,
    createSearchFilterControl,
} from '../../../common/filter/factories/specificControls';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';
import { ATTRIBUTES } from '../../../common/priceHistory/attributes';
import { STYLES } from '../common/styles';
import { SELECTORS } from './selectors';
import { createSeparator } from '../../../common/filter/factories/helpers';

const { createGlobalFilter } = createFilterFactory(processProductCards);
const onPriceTolerancePercentChange = () => processProductCards(true);

const nameFilter = createGlobalFilter('favorites-name-filter');
const bestPriceFilter = createGlobalFilter('best-price-filter', false);
const priceTolerancePercent = createGlobalFilter('price-tolerance-percent', 3, onPriceTolerancePercentChange);
const inStockOnlyFilter = createGlobalFilter('in-stock-only-filter', true);
const filterEnabled = createGlobalFilter('favorites-filter-enabled', true);

export async function initFavoritesMods() {
    const filterContainer = await waitForElement(document, SELECTORS.FILTER_CONTAINER);
    appendFilterControlsIfNeeded(filterContainer, appendFiltersContainer);

    await processProductCards();
    const observer = new MutationObserver(debounce(processProductCards));

    const productListContainer = getFirstElement(SELECTORS.PRODUCT_LIST_CONTAINER);
    observer.observe(productListContainer, {
        childList: true,
        subtree: true,
    });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);
    filtersContainer.classList.add('input-search');

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
    const inStockOnlyFilterDiv = createCheckboxFilterControl(
        'В наличии: ',
        inStockOnlyFilter,
        STYLES.CONTROL,
        STYLES.CHECKBOX_INPUT,
    );
    const separatorDiv = createSeparator(
        STYLES.CONTROL,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled,
        STYLES.CONTROL,
        STYLES.CHECKBOX_INPUT,
    );

    filtersContainer.append(
        nameFilterDiv,
        bestPriceDiv,
        priceTolerancePercentDiv,
        inStockOnlyFilterDiv,
        separatorDiv,
        filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
}

async function processProductCards(priceTolerancePercentChanged = false) {
    const productCards = [...getAllElements(SELECTORS.PRODUCT_CARDS)];

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

    const priceInfoWrap = getFirstElement(SELECTORS.PRICE_INFO_WRAP, productCard);
    if (!priceInfoWrap) return inStockOnlyFilter.value;

    await handlePriceData(productCard, priceInfoWrap, priceTolerancePercentChanged);

    const nameWrap = getFirstElement(SELECTORS.PRODUCT_CARD_NAME, productCard);
    if (!nameWrap) return true;

    const name = nameWrap.innerText;
    nameWrap.title = name;

    return (
        isNotMatchTextFilter(name, nameFilter) ||
        isNotMatchBestPriceFilter(productCard)
    );
}

async function handlePriceData(productCard, priceInfoWrap, priceTolerancePercentChanged) {
    await appendStoredPricesIfNeeded(productCard, priceInfoWrap);

    if (
        !priceTolerancePercentChanged ||
        !productCard.hasAttribute(ATTRIBUTES.CURRENT_PRICE) ||
        !productCard.hasAttribute(ATTRIBUTES.LOWEST_PRICE)
    ) {
        return;
    }

    const priceInfoContainer = priceInfoWrap.parentNode;
    checkIfGoodPriceFromAttributes(priceInfoContainer, productCard, priceTolerancePercent.value);
}

async function appendStoredPricesIfNeeded(productCard, priceInfoWrap) {
    if (productCard.hasAttribute(ATTRIBUTES.APPEND_PRICE_HISTORY_PASSED)) return;

    const outOfStockLabel = getFirstElement(SELECTORS.OUT_OF_STOCK_LABEL, productCard);
    if (outOfStockLabel) {
        productCard.setAttribute(ATTRIBUTES.APPEND_PRICE_HISTORY_PASSED, '');
        return;
    }

    const priceInfoContainer = priceInfoWrap.parentNode;

    await appendStoredPrices(priceInfoWrap, productCard, priceInfoContainer);

    if (productCard.hasAttribute(ATTRIBUTES.CURRENT_PRICE) &&
        productCard.hasAttribute(ATTRIBUTES.LOWEST_PRICE)) {
        checkIfGoodPriceFromAttributes(priceInfoContainer, productCard, priceTolerancePercent.value);
    }
}

async function appendStoredPrices(priceInfoWrap, productCard, priceInfoContainer) {
    const priceSpan = getPriceSpan(productCard, SELECTORS);
    const productCardLink = getFirstElement('a', productCard);

    if (!priceSpan || !productCardLink) return;

    const productArticle = getProductArticleFromLink(productCardLink);
    const priceData = await appendPriceHistory(priceInfoWrap, priceSpan, productArticle);

    if (priceData) {
        productCard.setAttribute(ATTRIBUTES.CURRENT_PRICE, priceData.current);
        productCard.setAttribute(ATTRIBUTES.LOWEST_PRICE, priceData.lowest);
        priceInfoContainer.style.display = 'block';
    }

    getFirstElement(SELECTORS.SIMILAR_BUTTON, priceInfoContainer)
        ?.remove();

    productCard.setAttribute(ATTRIBUTES.APPEND_PRICE_HISTORY_PASSED, '');
}

function isNotMatchBestPriceFilter(productCard) {
    return bestPriceFilter.value ? !productCard.hasAttribute(ATTRIBUTES.GOOD_PRICE) : false;
}
