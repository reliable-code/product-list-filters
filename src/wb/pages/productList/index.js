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
} from '../../../common/dom/helpers';
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
    filtersContainer.classList.add('input-search');

    const priceControlStyle = {
        ...STYLES.CONTROL,
        marginRight: '37px',
    };

    const nameFilterDiv =
        createSearchFilterControl(nameFilter, STYLES.CONTROL, STYLES.TEXT_INPUT);

    const minReviewsDiv =
        createMinReviewsFilterControl(minReviewsFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT);

    const maxReviewsDiv =
        createMaxReviewsFilterControl(maxReviewsFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT);

    const minRatingDiv =
        createMinRatingFilterControl(minRatingFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT);

    const minPriceDiv =
        createDiv(priceControlStyle, minPriceDivContent());

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT);

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
