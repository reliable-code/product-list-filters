import { debounce, waitForElement } from '../../common/dom/utils';
import {
    CHECKBOX_INPUT_STYLE,
    CONTROL_STYLE,
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

const FILTER_CONTAINER_SELECTOR = '.favorites-goods__head';
const PRODUCT_LIST_CONTAINER_SELECTOR = '.favorites-goods';
const PRODUCT_CARDS_SELECTOR = '.favorites-goods__list > .goods-card';
const PRICE_SELECTOR = '.wallet-price';

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

export function initFavoritesMods() {
    waitForElement(document, FILTER_CONTAINER_SELECTOR)
        .then((filterContainer) => {
            appendFilterControlsIfNeeded(filterContainer, appendFiltersContainer);

            const productListContainer = getFirstElement(PRODUCT_LIST_CONTAINER_SELECTOR);

            processList();
            const observer = new MutationObserver(debounce(processList));

            observer.observe(productListContainer, {
                childList: true,
                subtree: true,
            });
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

function processList(priceTolerancePercentChanged = false) {
    const productCards = getAllElements(PRODUCT_CARDS_SELECTOR);

    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                showElement(productCard);
                return;
            }

            const priceContainer = getFirstElement('.goods-card__price', productCard);

            if (!priceContainer) {
                showHideElement(productCard, inStockOnlyFilter.value);
                return;
            }

            appendStoredPriceValuesIfNeeded(productCard, priceContainer);

            if (priceTolerancePercentChanged &&
                productCard.hasAttribute(CURRENT_PRICE_ATTR) &&
                productCard.hasAttribute(LOWEST_PRICE_ATTR)) {
                const priceContainerWrap = priceContainer.parentNode;

                checkIfGoodPrice(priceContainerWrap, productCard, priceTolerancePercent.value);
            }

            const productCardNameWrap =
                getFirstElement(PRODUCT_CARD_NAME_SELECTOR, productCard);

            if (!productCardNameWrap) {
                hideElement(productCard);
                return;
            }

            const productCardName = productCardNameWrap.innerText;

            productCardNameWrap.title = productCardName;

            const isNotMatchBestPriceFilter =
                bestPriceFilter.value ? !productCard.hasAttribute(GOOD_PRICE_ATTR) : false;
            const conditionToHide =
                isNotMatchTextFilter(productCardName, nameFilter) ||
                isNotMatchBestPriceFilter;
            showHideElement(productCard, conditionToHide);
        },
    );
}

function appendStoredPriceValuesIfNeeded(productCard, priceContainer) {
    if (productCard.hasAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR)) return;

    const outOfStock = getFirstElement('.goods-card__out-stock', productCard);
    if (outOfStock) {
        productCard.setAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR, '');
        return;
    }

    const priceContainerWrap = priceContainer.parentNode;

    appendStoredPriceValues(priceContainer, productCard, priceContainerWrap);

    checkIfGoodPrice(priceContainerWrap, productCard, priceTolerancePercent.value);
}

function appendStoredPriceValues(priceContainer, productCard, priceContainerWrap) {
    const priceSpan = getFirstElement(PRICE_SELECTOR, productCard);
    const productCardLink = getFirstElement('a', productCard);

    if (!priceSpan || !productCardLink) return;

    const productArticle = getProductArticleFromLink(productCardLink);

    const priceData = appendPriceHistory(priceContainer, priceSpan, productArticle);
    productCard.setAttribute(CURRENT_PRICE_ATTR, priceData.current);
    productCard.setAttribute(LOWEST_PRICE_ATTR, priceData.lowest);

    getFirstElement('.goods-card__similar', priceContainerWrap)
        .remove();
    priceContainerWrap.style.display = 'block';

    productCard.setAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR, '');
}
