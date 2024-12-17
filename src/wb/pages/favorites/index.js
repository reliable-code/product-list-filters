import { debounce, waitForElement } from '../../../common/dom/utils';
import {
    CHECKBOX_INPUT_STYLE,
    CONTROL_STYLE,
    getPriceSpan,
    getProductArticleFromLink,
    NUMBER_INPUT_STYLE,
    PRODUCT_CARD_NAME_SELECTOR,
    TEXT_INPUT_STYLE,
} from '../common';
import { StoredInputValue } from '../../../common/storage/storage';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import { isNotMatchTextFilter } from '../../../common/filter/compare';
import {
    createCheckboxFilterControl,
    createNumberFilterControl,
} from '../../../common/filter/factories/genericControls';
import { hideElement, showElement, updateElementDisplay } from '../../../common/dom/manipulation';
import {
    applyStyles,
    getAllElements,
    getFirstElement,
    styleStringToObject,
} from '../../../common/dom/helpers';
import { ATTRIBUTES } from '../../../common/priceHistory/attributes';
import { appendPriceHistory, checkIfGoodPrice } from '../../../common/priceHistory/manipulation';
import {
    createEnabledFilterControl,
    createSearchFilterControl,
} from '../../../common/filter/factories/specificControls';
import { STYLES } from '../common/styles';

const SELECTORS = {
    FILTER_CONTAINER: '.favorites-goods__head',
    PRODUCT_LIST_CONTAINER: '.favorites-goods',
    PRODUCT_CARDS: '.favorites-goods__list > .goods-card',
    WALLET_PRICE: '.wallet-price',
    PRICE: '.goods-card__price-now',
};

const nameFilter =
    new StoredInputValue('favorites-name-filter', null, addProcessListToQueue);
const bestPriceFilter =
    new StoredInputValue('best-price-filter', false, addProcessListToQueue);
const onPriceTolerancePercentChange = () => addProcessListToQueue(true);
const priceTolerancePercent =
    new StoredInputValue('price-tolerance-percent', 3, onPriceTolerancePercentChange);
const inStockOnlyFilter =
    new StoredInputValue('in-stock-only-filter', true, addProcessListToQueue);
const filterEnabled =
    new StoredInputValue('favorites-filter-enabled', true, addProcessListToQueue);

let processListQueue = Promise.resolve();

export async function initFavoritesMods() {
    const filterContainer = await waitForElement(document, SELECTORS.FILTER_CONTAINER);

    appendFilterControlsIfNeeded(filterContainer, appendFiltersContainer);

    await addProcessListToQueue();
    const observer = new MutationObserver(debounce(addProcessListToQueue));

    const productListContainer = getFirstElement(SELECTORS.PRODUCT_LIST_CONTAINER);

    observer.observe(productListContainer, {
        childList: true,
        subtree: true,
    });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);

    const nameFilterDiv =
        createSearchFilterControl(
            nameFilter, styleStringToObject(CONTROL_STYLE), styleStringToObject(TEXT_INPUT_STYLE),
        );
    const bestPriceDiv =
        createCheckboxFilterControl(
            'Лучшая цена: ',
            bestPriceFilter,
            styleStringToObject(CONTROL_STYLE),
            styleStringToObject(CHECKBOX_INPUT_STYLE),
        );
    const priceTolerancePercentDiv =
        createNumberFilterControl(
            'Допуск цены, %: ',
            priceTolerancePercent,
            1,
            0,
            100,
            styleStringToObject(CONTROL_STYLE),
            styleStringToObject(NUMBER_INPUT_STYLE),
        );
    const inStockOnlyFilterDiv =
        createCheckboxFilterControl(
            'В наличии: ',
            inStockOnlyFilter,
            styleStringToObject(CONTROL_STYLE),
            styleStringToObject(CHECKBOX_INPUT_STYLE),
        );
    const filterEnabledDiv =
        createEnabledFilterControl(
            filterEnabled,
            styleStringToObject(CONTROL_STYLE),
            styleStringToObject(CHECKBOX_INPUT_STYLE),
        );

    filtersContainer.append(
        nameFilterDiv,
        bestPriceDiv,
        priceTolerancePercentDiv,
        inStockOnlyFilterDiv,
        filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
}

async function addProcessListToQueue(priceTolerancePercentChanged = false) {
    processListQueue = processListQueue.then(() => processList(priceTolerancePercentChanged));
}

async function processList(priceTolerancePercentChanged = false) {
    const productCards = [...getAllElements(SELECTORS.PRODUCT_CARDS)];

    await Promise.all(productCards.map(async (productCard) => {
        if (!filterEnabled.value) {
            showElement(productCard);
            return;
        }

        const priceContainer = getFirstElement('.goods-card__price', productCard);
        if (!priceContainer) {
            updateElementDisplay(productCard, inStockOnlyFilter.value);
            return;
        }

        await handlePriceData(productCard, priceContainer, priceTolerancePercentChanged);

        const productCardNameWrap = getFirstElement(PRODUCT_CARD_NAME_SELECTOR, productCard);
        if (!productCardNameWrap) {
            hideElement(productCard);
            return;
        }

        const productCardName = productCardNameWrap.innerText;
        productCardNameWrap.title = productCardName;

        const shouldHide =
            isNotMatchTextFilter(productCardName, nameFilter) ||
            isNotMatchBestPriceFilter(productCard);
        updateElementDisplay(productCard, shouldHide);
    }));
}

async function appendStoredPriceValuesIfNeeded(productCard, priceContainer) {
    if (productCard.hasAttribute(ATTRIBUTES.APPEND_PRICE_HISTORY_PASSED)) return;

    const outOfStock = getFirstElement('.goods-card__out-stock', productCard);
    if (outOfStock) {
        productCard.setAttribute(ATTRIBUTES.APPEND_PRICE_HISTORY_PASSED, '');
        return;
    }

    const priceContainerWrap = priceContainer.parentNode;

    await appendStoredPriceValues(priceContainer, productCard, priceContainerWrap);

    if (productCard.hasAttribute(ATTRIBUTES.CURRENT_PRICE) &&
        productCard.hasAttribute(ATTRIBUTES.LOWEST_PRICE)) {
        checkIfGoodPrice(priceContainerWrap, productCard, priceTolerancePercent.value);
    }
}

async function appendStoredPriceValues(priceContainer, productCard, priceContainerWrap) {
    const priceSpan = getPriceSpan(productCard, SELECTORS);
    const productCardLink = getFirstElement('a', productCard);

    if (!priceSpan || !productCardLink) return;

    const productArticle = getProductArticleFromLink(productCardLink);
    const priceData = await appendPriceHistory(priceContainer, priceSpan, productArticle);

    if (priceData) {
        productCard.setAttribute(ATTRIBUTES.CURRENT_PRICE, priceData.current);
        productCard.setAttribute(ATTRIBUTES.LOWEST_PRICE, priceData.lowest);
        priceContainerWrap.style.display = 'block';
    }

    getFirstElement('.goods-card__similar', priceContainerWrap)
        ?.remove();

    productCard.setAttribute(ATTRIBUTES.APPEND_PRICE_HISTORY_PASSED, '');
}

async function handlePriceData(productCard, priceContainer, priceTolerancePercentChanged) {
    await appendStoredPriceValuesIfNeeded(productCard, priceContainer);

    if (
        !priceTolerancePercentChanged ||
        !productCard.hasAttribute(ATTRIBUTES.CURRENT_PRICE) ||
        !productCard.hasAttribute(ATTRIBUTES.LOWEST_PRICE)
    ) {
        return;
    }

    const priceWrapper = priceContainer.parentNode;
    checkIfGoodPrice(priceWrapper, productCard, priceTolerancePercent.value);
}

function isNotMatchBestPriceFilter(productCard) {
    return bestPriceFilter.value ? !productCard.hasAttribute(ATTRIBUTES.GOOD_PRICE) : false;
}
