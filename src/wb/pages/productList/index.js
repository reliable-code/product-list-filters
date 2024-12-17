import { debounce, waitForElement } from '../../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import { getHash } from '../../../common/hash/helpers';
import { getURLPathElement, somePathElementEquals } from '../../../common/url';
import { createDiv } from '../../../common/dom/factories/elements';
import {
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../../../common/filter/compare';
import { showElement, updateElementDisplay } from '../../../common/dom/manipulation';
import {
    applyStyles,
    getAllElements,
    getFirstElement,
    getFirstElementInnerNumber,
    styleStringToObject,
} from '../../../common/dom/helpers';
import {
    CHECKBOX_INPUT_STYLE,
    CONTROL_STYLE,
    NUMBER_INPUT_STYLE,
    TEXT_INPUT_STYLE,
} from '../common';
import {
    createEnabledFilterControl,
    createMaxReviewsFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createSearchFilterControl,
} from '../../../common/filter/factories/specificControls';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';
import { SELECTORS } from './selectors';
import { STYLES } from '../common/styles';

const PRICE_FILTER_URL_PARAMS_NAME = 'priceU';

const SECTION_ID = getSectionId();

const { createSectionFilter } = createFilterFactory(processProductCards, SECTION_ID);

const nameFilter = createSectionFilter('name-filter');
const minReviewsFilter = createSectionFilter('min-reviews-filter');
const maxReviewsFilter = createSectionFilter('max-reviews-filter');
const minRatingFilter = createSectionFilter('min-rating-filter', 4.8);
const filterEnabled = createSectionFilter('filter-enabled', true);

let minPriceValue = getMinPriceValueFromURL();
const minPriceDivContent = () => `Минимальная цена: ${minPriceValue}`;

function getSectionId() {
    const sectionNamePosition = somePathElementEquals('brands') ? 2 : 3;
    const sectionName = getURLPathElement(sectionNamePosition, '');

    return (sectionName && sectionName !== 'search.aspx')
        ? getHash(sectionName)
        : 'common';
}

function getMinPriceValueFromURL() {
    const params = new URLSearchParams(window.location.search);

    if (!params.has(PRICE_FILTER_URL_PARAMS_NAME)) {
        return 0;
    }

    const priceFilterParams = params.get(PRICE_FILTER_URL_PARAMS_NAME);
    const priceFilterParamsArray = priceFilterParams.split(';');
    const minPriceFilterParam = priceFilterParamsArray[0];
    const minPriceFilterValue = minPriceFilterParam / 100;

    return minPriceFilterValue;
}

export async function initProductListMods() {
    const filtersBlockWrap = await waitForElement(document, SELECTORS.FILTERS_BLOCK_WRAP);
    appendFilterControlsIfNeeded(filtersBlockWrap, appendFiltersContainer);

    removeRecentItemsBlock();

    processProductCards();
    const productCardList = getFirstElement(SELECTORS.PRODUCT_CARD_LIST);
    const observer = new MutationObserver(debounce(processProductCards, 150));
    observer.observe(productCardList, {
        childList: true,
    });
}

function removeRecentItemsBlock() {
    const recentItems = getFirstElement('.j-recent-items');

    if (recentItems) {
        const { parentNode } = recentItems;
        parentNode.remove();
    }
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);

    const priceControlStyle =
        CONTROL_STYLE + // eslint-disable-line prefer-template
        'margin-right: 37px;';

    const priceControlStyleObj = styleStringToObject(priceControlStyle);

    const nameFilterDiv =
        createSearchFilterControl(nameFilter, styleStringToObject(CONTROL_STYLE), styleStringToObject(TEXT_INPUT_STYLE));

    const minReviewsDiv =
        createMinReviewsFilterControl(minReviewsFilter, styleStringToObject(CONTROL_STYLE), styleStringToObject(NUMBER_INPUT_STYLE));

    const maxReviewsDiv =
        createMaxReviewsFilterControl(maxReviewsFilter, styleStringToObject(CONTROL_STYLE), styleStringToObject(NUMBER_INPUT_STYLE));

    const minRatingDiv =
        createMinRatingFilterControl(minRatingFilter, styleStringToObject(CONTROL_STYLE), styleStringToObject(NUMBER_INPUT_STYLE));

    const minPriceDiv =
        createDiv(priceControlStyleObj, minPriceDivContent());

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, styleStringToObject(CONTROL_STYLE), styleStringToObject(CHECKBOX_INPUT_STYLE));

    setInterval(() => checkMinPrice(minPriceDiv), 500);

    filtersContainer.append(
        nameFilterDiv, minReviewsDiv, maxReviewsDiv, minRatingDiv, minPriceDiv, filterEnabledDiv,
    );
    parentNode.append(filtersContainer);
}

function checkMinPrice(minPriceDiv) {
    const currentMinPriceValue = getMinPriceValueFromURL();

    if (minPriceValue !== currentMinPriceValue) {
        minPriceValue = currentMinPriceValue;
        minPriceDiv.textContent = minPriceDivContent();
    }
}

function processProductCards() {
    const productCards = getAllElements(SELECTORS.PRODUCT_CARD);

    productCards.forEach(processProductCard);
}

function processProductCard(productCard) {
    if (!filterEnabled.value) {
        showElement(productCard);
        return;
    }

    const productCardNameWrap = getFirstElement(SELECTORS.PRODUCT_CARD_NAME, productCard);

    const productCardName = productCardNameWrap.innerText;
    productCardNameWrap.title = productCardName;
    productCardNameWrap.style.whiteSpace = 'normal';

    const productCardReviewsNumber = getFirstElementInnerNumber(
        productCard, SELECTORS.PRODUCT_CARD_REVIEWS, true,
    );
    const productCardRatingNumber = getFirstElementInnerNumber(
        productCard, SELECTORS.PRODUCT_CARD_RATING, true, true,
    );
    const productCardPriceNumber = getFirstElementInnerNumber(
        productCard, SELECTORS.PRODUCT_CARD_PRICE, true,
    );

    const shouldHide =
        isNotMatchTextFilter(productCardName, nameFilter) ||
        isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
        isGreaterThanFilter(productCardReviewsNumber, maxReviewsFilter) ||
        isLessThanFilter(productCardRatingNumber, minRatingFilter) ||
        productCardPriceNumber < minPriceValue;
    updateElementDisplay(productCard, shouldHide);
}
