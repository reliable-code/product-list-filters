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
import { hideElement, showElement, updateElementDisplay } from '../../../common/dom/manipulation';
import { getAllElements, getFirstElement } from '../../../common/dom/helpers';
import { ATTRIBUTES } from '../../../common/priceHistory/attributes';
import { appendPriceHistory, checkIfGoodPrice } from '../../../common/priceHistory/manipulation';
import {
    createEnabledFilterControl,
    createSearchFilterControl,
} from '../../../common/filter/factories/specificControls';
import { SELECTORS as COMMON_SELECTORS } from '../common/selectors';
import { STYLES } from '../common/styles';
import { SELECTORS } from './selectors';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';

const { createGlobalFilter } = createFilterFactory(addProcessProductCardsToQueue);

const onPriceTolerancePercentChange = () => addProcessProductCardsToQueue(true);

const nameFilter = createGlobalFilter('favorites-name-filter');
const bestPriceFilter = createGlobalFilter('best-price-filter', false);
const priceTolerancePercent = createGlobalFilter('price-tolerance-percent', 3, onPriceTolerancePercentChange);
const filterEnabled = createGlobalFilter('favorites-filter-enabled', true);

let processListQueue = Promise.resolve();

export async function initFavoritesMods() {
    const searchResultsSort = await waitForElement(document, COMMON_SELECTORS.SEARCH_RESULTS_SORT);
    appendFilterControlsIfNeeded(searchResultsSort, appendFiltersContainer);

    await addProcessProductCardsToQueue();

    const observer = new MutationObserver(debounce(addProcessProductCardsToQueue));

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

async function addProcessProductCardsToQueue(priceTolerancePercentChanged = false) {
    processListQueue = processListQueue.then(
        () => processProductCards(priceTolerancePercentChanged),
    );
}

async function processProductCards(priceTolerancePercentChanged = false) {
    const productCards = [...getAllElements(COMMON_SELECTORS.PRODUCT_CARDS)];
    const firstProductCardsWrap = getFirstProductCardsWrap();
    moveProductCardsToFirstWrap(productCards, firstProductCardsWrap);

    await Promise.all(productCards.map(
        (productCard) => processProductCard(productCard, priceTolerancePercentChanged),
    ));
}

async function processProductCard(productCard, priceTolerancePercentChanged) {
    if (!filterEnabled.value) {
        showElement(productCard);
        return;
    }

    await appendStoredPriceValuesIfNeeded(productCard);

    if (
        priceTolerancePercentChanged &&
        productCard.hasAttribute(ATTRIBUTES.CURRENT_PRICE) &&
        productCard.hasAttribute(ATTRIBUTES.LOWEST_PRICE)
    ) {
        const priceContainerWrap = getPriceContainer(productCard).parentNode;
        checkIfGoodPrice(priceContainerWrap, productCard, priceTolerancePercent.value);
    }

    const productCardNameWrap = getFirstElement(COMMON_SELECTORS.PRODUCT_CARD_NAME, productCard);

    if (!productCardNameWrap) {
        hideElement(productCard);
        return;
    }

    const productCardName = productCardNameWrap.innerText;
    productCardNameWrap.title = productCardName;

    const isNotMatchBestPriceFilter =
        bestPriceFilter.value ? !productCard.hasAttribute(ATTRIBUTES.GOOD_PRICE) : false;
    const shouldHide =
        isNotMatchTextFilter(productCardName, nameFilter) || isNotMatchBestPriceFilter;
    updateElementDisplay(productCard, shouldHide);
}

async function appendStoredPriceValuesIfNeeded(productCard) {
    if (productCard.hasAttribute(ATTRIBUTES.APPEND_PRICE_HISTORY_PASSED)) return;

    const additionalInfo = getFirstElement(SELECTORS.ADDITIONAL_INFO, productCard);
    if (additionalInfo?.innerText === 'Нет в наличии') {
        productCard.setAttribute(ATTRIBUTES.APPEND_PRICE_HISTORY_PASSED, '');
        return;
    }

    const priceContainer = getPriceContainer(productCard);
    const priceContainerWrap = priceContainer.parentNode;

    await appendStoredPriceValues(priceContainer, productCard, priceContainerWrap);

    if (productCard.hasAttribute(ATTRIBUTES.CURRENT_PRICE) &&
        productCard.hasAttribute(ATTRIBUTES.LOWEST_PRICE)) {
        checkIfGoodPrice(priceContainerWrap, productCard, priceTolerancePercent.value);
    }
}

function getPriceContainer(productCard) {
    return productCard?.children[0]?.children[1]?.children[0]?.children[0] || null;
}

async function appendStoredPriceValues(priceContainer, productCard, priceContainerWrap) {
    const productCardLink = getFirstElement('a', productCard);

    if (!productCardLink) return;

    const productArticle = getProductArticleFromLink(productCardLink);
    const priceSpan = getFirstElement('span', priceContainer);

    const priceData = await appendPriceHistory(priceContainer, priceSpan, productArticle);

    if (priceData) {
        productCard.setAttribute(ATTRIBUTES.CURRENT_PRICE, priceData.current);
        productCard.setAttribute(ATTRIBUTES.LOWEST_PRICE, priceData.lowest);

        priceContainerWrap.style.display = 'block';
    }

    productCard.setAttribute(ATTRIBUTES.APPEND_PRICE_HISTORY_PASSED, '');
}
