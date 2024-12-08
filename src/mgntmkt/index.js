import { waitForElement } from '../common/dom/utils';
import { StoredInputValue } from '../common/storage/localstorage';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { getURLPathElementEnding, pathnameIncludesSome } from '../common/url';
import { isLessThanFilter, isNotMatchTextFilter } from '../common/filter/compare';
import { hideElement, showElement, updateElementDisplay } from '../common/dom/manipulation';
import {
    applyStyles,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    getNodeInnerNumber,
} from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createSearchFilterControl,
} from '../common/filter/factories/specificControls';

const SELECTORS = {
    NOTIFICATION: '.notification',
    PROMOTIONAL_SHELF: '.promotional-shelf',
    CATEGORY_PRODUCTS: '#category-products',
    PRODUCT_CARD: ':scope > div:not(.products-controllers)',
    PRODUCT_CARD_NAME_WRAP: '.subtitle-item',
    PRODUCT_CARD_RATING_WRAP: '.orders',
    PRODUCT_CARD_RATING: '[data-test-id="text__rating"]',
};

let nameFilter;
let minReviewsFilter;
let minRatingFilter;
let filterEnabled;

(function initDocumentObserver() {
    const { documentElement } = document;

    const observer = new MutationObserver(async () => {
        if (documentElement.classList.contains('nprogress-busy')) return;

        if (pathnameIncludesSome(['category', 'search'])) {
            await initListClean();
        }
    });

    observer.observe(documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });
}());

async function initListClean() {
    const notification = await waitForElement(document, SELECTORS.NOTIFICATION);
    const promotional = getFirstElement(SELECTORS.PROMOTIONAL_SHELF, notification);
    if (promotional) promotional.remove();

    appendFilterControlsIfNeeded(notification, appendFiltersContainer, true);

    const productCardsWrap = getFirstElement(
        SELECTORS.CATEGORY_PRODUCTS, document, true,
    );
    new MutationObserver(processProductCards).observe(productCardsWrap, { childList: true });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    initFilters();

    applyStyles(filtersContainer, {
        display: 'flex',
        gridGap: '11px',
        marginBottom: '17px',
    });

    const controlStyle = {
        display: 'flex',
        alignItems: 'center',
        fontSize: '15px',
    };
    const inputStyle = {
        marginLeft: '5px',
        border: '1px solid rgba(0,0,0,.12)',
        borderRadius: '4px',
        color: 'rgba(0,0,0,.87)',
        fontFamily: 'Roboto,sans-serif',
        fontSize: '.875rem',
        padding: '8px 11px',
    };
    const textInputStyle = {
        ...inputStyle,
        width: '180px',
    };
    const numberInputStyle = {
        ...inputStyle,
        width: '90px',
    };
    const checkboxInputStyle = {
        marginLeft: '5px',
        width: '23px',
        height: '23px',
    };

    const nameFilterDiv = createSearchFilterControl(
        nameFilter, controlStyle, textInputStyle,
    );
    const minReviewsDiv = createMinReviewsFilterControl(
        minReviewsFilter, controlStyle, numberInputStyle,
    );
    const minRatingDiv = createMinRatingFilterControl(
        minRatingFilter, controlStyle, numberInputStyle,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, controlStyle, checkboxInputStyle,
    );

    filtersContainer.append(
        nameFilterDiv, minReviewsDiv, minRatingDiv, filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
}

function initFilters() {
    const sectionId = getURLPathElementEnding(2);

    const createFilter = (filterName, defaultValue) => (
        StoredInputValue.createWithCompositeKey(
            sectionId, filterName, defaultValue, processProductCards,
        )
    );

    nameFilter = createFilter('name-filter', null);
    minReviewsFilter = createFilter('min-reviews-filter', null);
    minRatingFilter = createFilter('min-rating-filter', 4.8);
    filterEnabled = createFilter('filter-enabled', true);
}

function processProductCards() {
    const productCardsWrap = getFirstElement(
        SELECTORS.CATEGORY_PRODUCTS, document, true,
    );
    const productCards = getAllElements(
        SELECTORS.PRODUCT_CARD, productCardsWrap,
    );

    productCards.forEach(processProductCard);
}

function processProductCard(productCard) {
    if (!filterEnabled.value) {
        showElement(productCard);
        return;
    }

    const productCardNameWrap = getFirstElement(
        SELECTORS.PRODUCT_CARD_NAME_WRAP, productCard,
    );
    const productCardRatingWrap = getFirstElement(
        SELECTORS.PRODUCT_CARD_RATING_WRAP, productCard,
    );
    const productCardRating = getFirstElement(
        SELECTORS.PRODUCT_CARD_RATING, productCardRatingWrap,
    );

    if (!productCardNameWrap || !productCardRating) {
        hideElement(productCard);
        return;
    }

    const productCardName = productCardNameWrap.innerText;
    const productCardReviewsNumber = getNodeInnerNumber(
        productCardRatingWrap.childNodes[1], true,
    );
    const productCardRatingNumber = getElementInnerNumber(
        productCardRating, true,
    );

    const shouldHide =
        isNotMatchTextFilter(productCardName, nameFilter) ||
        isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
        isLessThanFilter(productCardRatingNumber, minRatingFilter);
    updateElementDisplay(productCard, shouldHide);
}
