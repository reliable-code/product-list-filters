import { debounce, waitForElement } from '../../common/dom/utils';
import {
    CHECKBOX_INPUT_STYLE,
    CONTROL_STYLE,
    getFirstProductCardsWrap,
    getProductArticleFromLink,
    moveProductCardToFirstWrapIfNeeded,
    NUMBER_INPUT_STYLE,
    PRODUCT_CARD_NAME_SELECTOR,
    PRODUCT_CARDS_SELECTOR,
    SEARCH_RESULTS_SORT_SELECTOR,
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

const PAGINATOR_SELECTOR = '[data-widget="paginator"]';

const nameFilter =
    new StoredInputValue('favorites-name-filter', null, processList);
const bestPriceFilter =
    new StoredInputValue('best-price-filter', false, processList);
const onPriceTolerancePercentChange = () => processList(true);
const priceTolerancePercent =
    new StoredInputValue('price-tolerance-percent', 3, onPriceTolerancePercentChange);
const filterEnabled =
    new StoredInputValue('favorites-filter-enabled', true, processList);

export function initFavoritesMods() {
    waitForElement(document, SEARCH_RESULTS_SORT_SELECTOR)
        .then((searchResultsSort) => {
            appendFilterControlsIfNeeded(searchResultsSort, appendFiltersContainer);

            const paginator = getFirstElement(PAGINATOR_SELECTOR);

            processList();
            const observer = new MutationObserver(debounce(processList));

            observer.observe(paginator, {
                childList: true,
                subtree: true,
            });
        });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    setCommonFiltersContainerStyles(filtersContainer, parentNode);

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
    const filterEnabledDiv =
        createEnabledFilterControl(
            filterEnabled,
            CONTROL_STYLE,
            CHECKBOX_INPUT_STYLE,
        );

    filtersContainer.append(
        nameFilterDiv, bestPriceDiv, priceTolerancePercentDiv, filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
}

function processList(priceTolerancePercentChanged = false) {
    const productCards = getAllElements(PRODUCT_CARDS_SELECTOR);

    const firstProductCardsWrap = getFirstProductCardsWrap();

    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                showElement(productCard);
                return;
            }

            moveProductCardToFirstWrapIfNeeded(productCard, firstProductCardsWrap);

            appendStoredPriceValuesIfNeeded(productCard);

            if (priceTolerancePercentChanged &&
                productCard.hasAttribute(CURRENT_PRICE_ATTR) &&
                productCard.hasAttribute(LOWEST_PRICE_ATTR)) {
                const priceContainerWrap = getPriceContainer(productCard).parentNode;

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

function appendStoredPriceValuesIfNeeded(productCard) {
    if (productCard.hasAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR)) return;

    const additionalInfoDiv = getFirstElement('.tsBodyControl400Small', productCard);
    if (additionalInfoDiv) {
        const notInStock = additionalInfoDiv.innerText === 'Нет в наличии';

        if (notInStock) {
            productCard.setAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR, '');
            return;
        }
    }

    const priceContainer = getPriceContainer(productCard);
    const priceContainerWrap = priceContainer.parentNode;

    appendStoredPriceValues(priceContainer, productCard, priceContainerWrap);

    if (productCard.hasAttribute(CURRENT_PRICE_ATTR) &&
        productCard.hasAttribute(LOWEST_PRICE_ATTR)) {
        checkIfGoodPrice(priceContainerWrap, productCard, priceTolerancePercent.value);
    }
}

function getPriceContainer(productCard) {
    return productCard.children[0].children[1].children[0].children[0];
}

function appendStoredPriceValues(priceContainer, productCard, priceContainerWrap) {
    const productCardLink = getFirstElement('a', productCard);

    if (!productCardLink) return;

    const productArticle = getProductArticleFromLink(productCardLink);
    const priceSpan = getFirstElement('span', priceContainer);

    const priceData = appendPriceHistory(priceContainer, priceSpan, productArticle);

    if (priceData) {
        productCard.setAttribute(CURRENT_PRICE_ATTR, priceData.current);
        productCard.setAttribute(LOWEST_PRICE_ATTR, priceData.lowest);

        priceContainerWrap.style.display = 'block';
    }

    productCard.setAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR, '');
}
