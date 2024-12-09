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

function appendFiltersContainer(filtersContainer, parentNode) {
    const filtersContainerStyle = {
        display: 'flex',
        gridGap: '11px',
        marginBottom: '18px',
    };

    applyStyles(filtersContainer, filtersContainerStyle);

    const controlStyle = {
        display: 'flex',
        alignItems: 'center',
        fontSize: '16px',
    };

    const inputStyle = {
        marginLeft: '5px',
        border: '1px solid #dadcde',
        borderRadius: '8px',
        padding: '8px 16px',
        fontSize: '16px',
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
        width: '22px',
        height: '22px',
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
