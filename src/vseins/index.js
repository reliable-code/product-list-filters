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

const PRODUCT_LIST_SELECTOR = '[data-qa="listing"] > div';

const CATEGORY_NAME = getCategoryName();

function getCategoryName() {
    const pathElements = getPathElements();
    const categoryName = pathElements[2] ?? 'common';

    return categoryName;
}

function getPathElements() {
    const { pathname } = window.location;
    return pathname.split('/');
}

const nameFilter =
    new StoredInputValue(`${CATEGORY_NAME}-name-filter`, null, processCards);
const minReviewsFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-reviews-filter`, null, processCards);
const minRatingFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-rating-filter`, 4.8, processCards);
const filterEnabled =
    new StoredInputValue(`${CATEGORY_NAME}-filter-enabled`, true, processCards);

initListClean();

function initListClean() {
    waitForElement(document, '#product-listing-top')
        .then(() => {
            const productList = getFirstElement(PRODUCT_LIST_SELECTOR, document, true);

            appendFilterControlsIfNeeded(productList, appendFiltersContainer, true);

            new MutationObserver(processCards).observe(productList, {
                childList: true,
                subtree: true,
            });
        });
}

const STYLES_BASE = {
    input: {
        marginLeft: '5px',
        border: '1px solid #dadcde',
        borderRadius: '8px',
        padding: '8px 16px',
        fontSize: '16px',
    },
};

const STYLES = {
    filtersContainer: {
        display: 'flex',
        gridGap: '11px',
        marginBottom: '18px',
    },
    control: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '16px',
    },
    textInput: {
        ...STYLES_BASE.input,
        width: '180px',
    },
    numberInput: {
        ...STYLES_BASE.input,
        width: '90px',
    },
    checkboxInput: {
        marginLeft: '5px',
        width: '22px',
        height: '22px',
    },
};

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

function processCards() {
    const productCards = getAllElements(PRODUCT_LIST_SELECTOR);

    productCards.forEach(processCard);
}

function processCard(productCard) {
    if (!filterEnabled.value) {
        showElement(productCard);
        return;
    }

    const productCardNameWrap =
        getFirstElement('[data-qa="product-name"]', productCard);

    const productCardRatingWrap =
        getFirstElement('[data-qa="product-rating"]', productCard);

    if (!productCardNameWrap || !productCardRatingWrap) {
        hideElement(productCard);
        return;
    }

    const productCardName = productCardNameWrap.innerText;

    const productCardReviewsNumber =
        getNodeInnerNumber(productCardRatingWrap.childNodes[2], true);

    const productCardRating = getFirstElement('[name="rating"]', productCardRatingWrap);
    const productCardRatingNumber = +productCardRating.getAttribute('value');

    const shouldHide =
        isNotMatchTextFilter(productCardName, nameFilter) ||
        isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
        isLessThanFilter(productCardRatingNumber, minRatingFilter);
    updateElementDisplay(productCard, shouldHide);
}
