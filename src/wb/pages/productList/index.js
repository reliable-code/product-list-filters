import { debounce, waitForElement } from '../../../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import { getHashOrDefault } from '../../../common/hash/helpers';
import {
    getURLPathElement,
    getURLQueryStringParam,
    somePathElementEquals,
} from '../../../common/url';
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
    createMaxPriceFilterControl,
    createMaxReviewsFilterControl,
    createMinPriceFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createSearchFilterControl,
} from '../../../common/filter/factories/specificControls';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';
import { SELECTORS } from './selectors';
import { STYLES } from '../common/styles';
import { createSeparator } from '../../../common/filter/factories/helpers';

const SECTION_ID = getSectionId();

const { createSectionFilter } = createFilterFactory(processProductCards, SECTION_ID);

const nameFilter = createSectionFilter('name-filter');
const minReviewsFilter = createSectionFilter('min-reviews-filter');
const maxReviewsFilter = createSectionFilter('max-reviews-filter');
const minRatingFilter = createSectionFilter('min-rating-filter', 4.8);
const minPriceFilter = createSectionFilter('min-price-filter');
const maxPriceFilter = createSectionFilter('max-price-filter');
const filterEnabled = createSectionFilter('filter-enabled', true);

function getSectionId() {
    const sectionName = somePathElementEquals('search.aspx')
        ? getURLQueryStringParam('search')
        : getURLPathElement(getSectionPosition(), '');

    return getHashOrDefault(sectionName);
}

function getSectionPosition() {
    return somePathElementEquals('brands') ? 2 : 3;
}

export async function initProductListMods() {
    const filtersBlockWrap = await waitForElement(document, SELECTORS.FILTERS_BLOCK_WRAP);
    appendFilterControlsIfNeeded(filtersBlockWrap, appendFiltersContainer);

    processProductCards();
    const productCardList = getFirstElement(SELECTORS.PRODUCT_CARD_LIST);
    const observer = new MutationObserver(debounce(processProductCards, 150));
    observer.observe(productCardList, {
        childList: true,
    });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);
    filtersContainer.classList.add('input-search');

    const nameFilterDiv = createSearchFilterControl(
        nameFilter, STYLES.CONTROL, STYLES.TEXT_INPUT,
    );
    const minReviewsDiv = createMinReviewsFilterControl(
        minReviewsFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const maxReviewsDiv = createMaxReviewsFilterControl(
        maxReviewsFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const minRatingDiv = createMinRatingFilterControl(
        minRatingFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const minPriceDiv = createMinPriceFilterControl(
        minPriceFilter, STYLES.CONTROL, STYLES.PRICE_INPUT,
    );
    const maxPriceDiv = createMaxPriceFilterControl(
        maxPriceFilter, STYLES.CONTROL, STYLES.PRICE_INPUT,
    );
    const separatorDiv = createSeparator(
        STYLES.CONTROL,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );

    filtersContainer.append(
        nameFilterDiv,
        minReviewsDiv,
        maxReviewsDiv,
        minRatingDiv,
        minPriceDiv,
        maxPriceDiv,
        separatorDiv,
        filterEnabledDiv,
    );
    parentNode.append(filtersContainer);
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
        isLessThanFilter(productCardPriceNumber, minPriceFilter) ||
        isGreaterThanFilter(productCardPriceNumber, maxPriceFilter);
    updateElementDisplay(productCard, shouldHide);
}
