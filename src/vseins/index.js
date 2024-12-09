import { waitForElement } from '../common/dom/utils';
import { StoredInputValue } from '../common/storage/localstorage';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { isLessThanFilter, isNotMatchTextFilter } from '../common/filter/compare';
import { hideElement, showElement, updateElementDisplay } from '../common/dom/manipulation';
import {
    applyStyles,
    getAllElements,
    getFirstElement,
    getNodeInnerNumber,
} from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createSearchFilterControl,
} from '../common/filter/factories/specificControls';
import { STYLES } from './styles';
import { getURLPathElement } from '../common/url';
import { SELECTORS } from './selectors';

const SECTION_ID = getURLPathElement(2);

function createFilter(filterName, defaultValue = null) {
    return StoredInputValue.createWithCompositeKey(
        SECTION_ID, filterName, defaultValue, processProductCards,
    );
}

const nameFilter = createFilter('name-filter');
const minReviewsFilter = createFilter('min-reviews-filter');
const minRatingFilter = createFilter('min-rating-filter', 4.8);
const filterEnabled = createFilter('filter-enabled', true);

await initListClean();

async function initListClean() {
    const productListTop = await waitForElement(document, SELECTORS.PRODUCT_LIST_TOP);

    if (!productListTop) return;

    const productList = getFirstElement(SELECTORS.PRODUCT_LIST, document, true);
    appendFilterControlsIfNeeded(productList, appendFiltersContainer, true);

    const observer = new MutationObserver(processProductCards);
    observer.observe(productList, {
        childList: true,
        subtree: true,
    });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.filtersContainer);

    const nameFilterDiv = createSearchFilterControl(
        nameFilter, STYLES.control, STYLES.textInput,
    );
    const minReviewsDiv = createMinReviewsFilterControl(
        minReviewsFilter, STYLES.control, STYLES.numberInput,
    );
    const minRatingDiv = createMinRatingFilterControl(
        minRatingFilter, STYLES.control, STYLES.numberInput,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.control, STYLES.checkboxInput,
    );

    filtersContainer.append(
        nameFilterDiv, minReviewsDiv, minRatingDiv, filterEnabledDiv,
    );

    parentNode.parentNode.insertBefore(filtersContainer, parentNode);
}

function processProductCards() {
    const productCards = getAllElements(`${SELECTORS.PRODUCT_LIST} > div`);

    productCards.forEach(processProductCard);
}

function processProductCard(productCard) {
    if (!filterEnabled.value) {
        showElement(productCard);
        return;
    }

    const productCardNameWrap = getFirstElement(SELECTORS.PRODUCT_NAME_WRAP, productCard);
    const productCardRatingWrap = getFirstElement(SELECTORS.PRODUCT_RATING_WRAP, productCard);

    if (!productCardNameWrap || !productCardRatingWrap) {
        hideElement(productCard);
        return;
    }

    const productCardName = productCardNameWrap.innerText;

    const productCardReviewsNumber =
        getNodeInnerNumber(productCardRatingWrap.childNodes[2], true);

    const productCardRating = getFirstElement(SELECTORS.PRODUCT_RATING, productCardRatingWrap);
    const productCardRatingNumber = +productCardRating.getAttribute('value');

    const shouldHide =
        isNotMatchTextFilter(productCardName, nameFilter) ||
        isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
        isLessThanFilter(productCardRatingNumber, minRatingFilter);
    updateElementDisplay(productCard, shouldHide);
}
