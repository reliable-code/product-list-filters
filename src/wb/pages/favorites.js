import { debounce, waitForElement } from '../../common/dom/utils';
import {
    CHECKBOX_INPUT_STYLE,
    CONTROL_STYLE,
    getPriceSpan,
    getProductArticleFromLink,
    NUMBER_INPUT_STYLE,
    PRODUCT_CARD_NAME_SELECTOR,
    setCommonFiltersContainerStyles,
    TEXT_INPUT_STYLE,
} from './common/common';
import { StoredInputValue } from '../../common/storage/storage';
import { appendFilterControlsIfNeeded } from '../../common/filter/manager';
import { isNotMatchTextFilter } from '../../common/filter/compare';
import {
    createEnabledFilterControl,
    createFilterControlCheckbox,
    createFilterControlNumber,
    createNameFilterControl,
} from '../../common/filter/controlsFactory';
import { hideElement, showElement, showHideElement } from '../../common/dom/manipulation';
import { getAllElements, getFirstElement } from '../../common/dom/helpers';
import {
    APPEND_STORED_PRICE_VALUES_PASSED_ATTR,
    CURRENT_PRICE_ATTR,
    GOOD_PRICE_ATTR,
    LOWEST_PRICE_ATTR,
} from '../../common/priceHistory/constants';
import { appendPriceHistory, checkIfGoodPrice } from '../../common/priceHistory/manipulation';

const SELECTORS = {
    FILTER_CONTAINER: '.favorites-goods__head',
    PRODUCT_LIST_CONTAINER: '.favorites-goods',
    PRODUCT_CARDS: '.favorites-goods__list > .goods-card',
    WALLET_PRICE: '.wallet-price',
    PRICE: '.goods-card__price-now',
};

const nameFilter =
    new StoredInputValue('favorites-name-filter', null, processList);
const bestPriceFilter =
    new StoredInputValue('best-price-filter', false, processList);
const onPriceTolerancePercentChange = () => processList(true);
const priceTolerancePercent =
    new StoredInputValue('price-tolerance-percent', 3, onPriceTolerancePercentChange);
const inStockOnlyFilter =
    new StoredInputValue('in-stock-only-filter', true, processList);
const filterEnabled =
    new StoredInputValue('favorites-filter-enabled', true, processList);

export async function initFavoritesMods() {
    const filterContainer = await waitForElement(document, SELECTORS.FILTER_CONTAINER);

    if (filterContainer) {
        appendFilterControlsIfNeeded(filterContainer, appendFiltersContainer);
    }

    const productListContainer = getFirstElement(SELECTORS.PRODUCT_LIST_CONTAINER);

    await processList();

    const observer = new MutationObserver(debounce(processList));

    observer.observe(productListContainer, {
        childList: true,
        subtree: true,
    });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    setCommonFiltersContainerStyles(filtersContainer);

    const nameFilterDiv =
        createNameFilterControl(
            nameFilter, CONTROL_STYLE, TEXT_INPUT_STYLE,
        );
    const bestPriceDiv =
        createFilterControlCheckbox(
            'Лучшая цена: ',
            bestPriceFilter,
            CONTROL_STYLE,
            CHECKBOX_INPUT_STYLE,
        );
    const priceTolerancePercentDiv =
        createFilterControlNumber(
            'Допуск цены, %: ',
            priceTolerancePercent,
            1,
            0,
            100,
            CONTROL_STYLE,
            NUMBER_INPUT_STYLE,
        );
    const inStockOnlyFilterDiv =
        createFilterControlCheckbox(
            'В наличии: ',
            inStockOnlyFilter,
            CONTROL_STYLE,
            CHECKBOX_INPUT_STYLE,
        );
    const filterEnabledDiv =
        createEnabledFilterControl(
            filterEnabled,
            CONTROL_STYLE,
            CHECKBOX_INPUT_STYLE,
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

async function processList(priceTolerancePercentChanged = false) {
    const productCards = [...getAllElements(SELECTORS.PRODUCT_CARDS)];

    await Promise.all(productCards.map(async (productCard) => {
        if (!filterEnabled.value) {
            showElement(productCard);
            return;
        }

        const priceContainer = getFirstElement('.goods-card__price', productCard);
        if (!priceContainer) {
            showHideElement(productCard, inStockOnlyFilter.value);
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

        const conditionToHide =
            isNotMatchTextFilter(productCardName, nameFilter) ||
            isNotMatchBestPriceFilter(productCard);
        showHideElement(productCard, conditionToHide);
    }));
}

async function appendStoredPriceValuesIfNeeded(productCard, priceContainer) {
    if (productCard.hasAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR)) return;

    const outOfStock = getFirstElement('.goods-card__out-stock', productCard);
    if (outOfStock) {
        productCard.setAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR, '');
        return;
    }

    const priceContainerWrap = priceContainer.parentNode;

    await appendStoredPriceValues(priceContainer, productCard, priceContainerWrap);

    if (productCard.hasAttribute(CURRENT_PRICE_ATTR) &&
        productCard.hasAttribute(LOWEST_PRICE_ATTR)) {
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
        productCard.setAttribute(CURRENT_PRICE_ATTR, priceData.current);
        productCard.setAttribute(LOWEST_PRICE_ATTR, priceData.lowest);
        priceContainerWrap.style.display = 'block';
    }

    getFirstElement('.goods-card__similar', priceContainerWrap)
        ?.remove();

    productCard.setAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR, '');
}

async function handlePriceData(productCard, priceContainer, priceTolerancePercentChanged) {
    await appendStoredPriceValuesIfNeeded(productCard, priceContainer);

    if (
        !priceTolerancePercentChanged ||
        !productCard.hasAttribute(CURRENT_PRICE_ATTR) ||
        !productCard.hasAttribute(LOWEST_PRICE_ATTR)
    ) {
        return;
    }

    const priceWrapper = priceContainer.parentNode;
    checkIfGoodPrice(priceWrapper, productCard, priceTolerancePercent.value);
}

function isNotMatchBestPriceFilter(productCard) {
    return bestPriceFilter.value ? !productCard.hasAttribute(GOOD_PRICE_ATTR) : false;
}
