import {
    addGlobalStyle,
    debounce,
    getAllElements,
    getFirstElement,
    showHideElement,
    waitForElement,
} from '../../common/dom';
import {
    appendPriceHistory,
    CHECKBOX_INPUT_STYLE,
    CONTROL_STYLE,
    getFirstProductCardsWrap,
    getProductArticleFromLink,
    moveProductCardToFirstWrapIfNeeded,
    PRODUCT_CARDS_SELECTOR,
    SEARCH_RESULTS_SORT_SELECTOR,
    setCommonFiltersContainerStyles,
} from './common/common';
import { StoredInputValue } from '../../common/storage';
import { appendFilterControlsIfNeeded, createFilterControlCheckbox } from '../../common/filter';

const PAGINATOR_SELECTOR = '[data-widget="paginator"]';
const APPEND_STORED_PRICE_VALUES_PASSED_ATTR = 'appendStoredPriceValuesPassed';
const GOOD_PRICE_ATTR = 'goodPrice';

const bestPriceFilter =
    new StoredInputValue('best-price-filter', false, processList);

export function initFavoritesMods() {
    waitForElement(document, SEARCH_RESULTS_SORT_SELECTOR)
        .then((searchResultsSort) => {
            appendFilterControlsIfNeeded(searchResultsSort, appendFiltersContainer);

            const paginator = getFirstElement(PAGINATOR_SELECTOR);

            const observer = new MutationObserver(debounce(processList));

            observer.observe(paginator, {
                childList: true,
                subtree: true,
            });
        });

    hideUnwantedElements();
}

function appendFiltersContainer(filtersContainer, parentNode) {
    setCommonFiltersContainerStyles(filtersContainer, parentNode);

    const bestPriceDiv =
        createFilterControlCheckbox(
            'Лучшая цена: ', bestPriceFilter, CONTROL_STYLE, CHECKBOX_INPUT_STYLE,
        );

    filtersContainer.append(bestPriceDiv);

    parentNode.append(filtersContainer);
}

function processList() {
    const productCards = getAllElements(PRODUCT_CARDS_SELECTOR);

    const firstProductCardsWrap = getFirstProductCardsWrap();

    productCards.forEach(
        (productCard) => {
            moveProductCardToFirstWrapIfNeeded(productCard, firstProductCardsWrap);

            appendStoredPriceValues(productCard);

            const conditionToHide =
                bestPriceFilter.value ? !productCard.hasAttribute(GOOD_PRICE_ATTR) : false;
            showHideElement(productCard, conditionToHide);
        },
    );
}

function appendStoredPriceValues(productCard) {
    if (productCard.hasAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR)) {
        return;
    }

    const additionalInfoDiv = getFirstElement('.tsBodyControl400Small', productCard);
    if (additionalInfoDiv) {
        const notInStock = additionalInfoDiv.innerText === 'Нет в наличии';

        if (notInStock) {
            productCard.setAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR, '');
            return;
        }
    }

    const productCardLink = getFirstElement('a', productCard);

    if (!productCardLink) return;

    const productArticle = getProductArticleFromLink(productCardLink);

    const priceContainer = productCard.children[0].children[1].children[0].children[0];

    const priceData = appendPriceHistory(priceContainer, productArticle);

    const priceContainerWrap = priceContainer.parentNode;
    priceContainerWrap.style.display = 'block';

    const priceToleranceFactor = 1.03;
    const goodPrice = priceData.lowest * priceToleranceFactor;

    if (priceData.current <= goodPrice) {
        priceContainerWrap.style.border = '3px solid rgb(214, 245, 177)';
        priceContainerWrap.style.borderRadius = '14px';
        priceContainerWrap.style.padding = '4px 10px 6px';
        priceContainerWrap.style.marginBottom = '5px';
        priceContainerWrap.style.width = '-webkit-fill-available';

        productCard.setAttribute(GOOD_PRICE_ATTR, '');
    }

    productCard.setAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR, '');
}

function hideUnwantedElements() {
    const css =
        '[data-widget="skuGrid"] {' +
        '   display: none !important;' +
        '}';

    addGlobalStyle(css);
}
