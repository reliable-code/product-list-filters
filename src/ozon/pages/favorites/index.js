import { debounce, waitForElement } from '../../../common/dom/utils';
import {
    getFirstProductCardsWrap,
    getProductArticleFromLink,
    moveProductCardsToFirstWrap,
    setCommonFiltersContainerStyles,
} from '../common';
import { StoredInputValue } from '../../../common/storage/storage';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import { isNotMatchTextFilter } from '../../../common/filter/compare';
import {
    createCheckboxFilterControl,
    createNumberFilterControl,
} from '../../../common/filter/factories/genericControls';
import { hideElement, showElement, updateElementDisplay } from '../../../common/dom/manipulation';
import { getAllElements, getFirstElement } from '../../../common/dom/helpers';
import {
    APPEND_STORED_PRICE_VALUES_PASSED_ATTR,
    CURRENT_PRICE_ATTR,
    GOOD_PRICE_ATTR,
    LOWEST_PRICE_ATTR,
} from '../../../common/priceHistory/constants';
import { appendPriceHistory, checkIfGoodPrice } from '../../../common/priceHistory/manipulation';
import {
    createEnabledFilterControl,
    createSearchFilterControl,
} from '../../../common/filter/factories/specificControls';
import { SELECTORS as COMMON_SELECTORS } from '../common/selectors';
import { STYLES } from '../common/styles';
import { SELECTORS } from './selectors';

const nameFilter =
    new StoredInputValue('favorites-name-filter', null, addProcessListToQueue);
const bestPriceFilter =
    new StoredInputValue('best-price-filter', false, addProcessListToQueue);
const onPriceTolerancePercentChange = () => addProcessListToQueue(true);
const priceTolerancePercent =
    new StoredInputValue('price-tolerance-percent', 3, onPriceTolerancePercentChange);
const filterEnabled =
    new StoredInputValue('favorites-filter-enabled', true, addProcessListToQueue);

let processListQueue = Promise.resolve();

export async function initFavoritesMods() {
    const searchResultsSort = await waitForElement(document, COMMON_SELECTORS.SEARCH_RESULTS_SORT);
    appendFilterControlsIfNeeded(searchResultsSort, appendFiltersContainer);

    await addProcessListToQueue();

    const observer = new MutationObserver(debounce(addProcessListToQueue));

    const paginator = getFirstElement(SELECTORS.PAGINATOR);
    observer.observe(paginator, {
        childList: true,
        subtree: true,
    });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    setCommonFiltersContainerStyles(filtersContainer, parentNode);

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
}

async function addProcessListToQueue(priceTolerancePercentChanged = false) {
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
        productCard.hasAttribute(CURRENT_PRICE_ATTR) &&
        productCard.hasAttribute(LOWEST_PRICE_ATTR)
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
        bestPriceFilter.value ? !productCard.hasAttribute(GOOD_PRICE_ATTR) : false;
    const shouldHide =
        isNotMatchTextFilter(productCardName, nameFilter) || isNotMatchBestPriceFilter;
    updateElementDisplay(productCard, shouldHide);
}

async function appendStoredPriceValuesIfNeeded(productCard) {
    if (productCard.hasAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR)) return;

    const additionalInfo = getFirstElement(SELECTORS.ADDITIONAL_INFO, productCard);
    if (additionalInfo?.innerText === 'Нет в наличии') {
        productCard.setAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR, '');
        return;
    }

    const priceContainer = getPriceContainer(productCard);
    const priceContainerWrap = priceContainer.parentNode;

    await appendStoredPriceValues(priceContainer, productCard, priceContainerWrap);

    if (productCard.hasAttribute(CURRENT_PRICE_ATTR) &&
        productCard.hasAttribute(LOWEST_PRICE_ATTR)) {
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
        productCard.setAttribute(CURRENT_PRICE_ATTR, priceData.current);
        productCard.setAttribute(LOWEST_PRICE_ATTR, priceData.lowest);

        priceContainerWrap.style.display = 'block';
    }

    productCard.setAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR, '');
}
