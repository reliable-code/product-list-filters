import { waitForElement } from '../common/dom/utils';
import { StoredInputValue } from '../common/storage/localstorage';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { isLessThanFilter, isNotMatchTextFilter } from '../common/filter/compare';
import { hideElement, showElement, updateElementDisplay } from '../common/dom/manipulation';
import {
    getAllElements,
    getFirstElement,
    getNodeInnerNumber,
    styleStringToObject,
} from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createSearchFilterControl,
} from '../common/filter/factories/specificControls';

const PRODUCT_LIST_SELECTOR = '[data-qa="listing"]';

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
    new StoredInputValue(`${CATEGORY_NAME}-name-filter`, null, cleanList);
const minReviewsFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-reviews-filter`, null, cleanList);
const minRatingFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-rating-filter`, 4.8, cleanList);
const filterEnabled =
    new StoredInputValue(`${CATEGORY_NAME}-filter-enabled`, true, cleanList);

initListClean();

function initListClean() {
    waitForElement(document, '#product-listing-top')
        .then(() => {
            const productList = getFirstElement(PRODUCT_LIST_SELECTOR, document, true);

            appendFilterControlsIfNeeded(productList, appendFiltersContainer, true);

            new MutationObserver(cleanList).observe(productList, {
                childList: true,
                subtree: true,
            });
        });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    filtersContainer.style =
        'display: flex;' +
        'grid-gap: 11px;' +
        'margin-bottom: 18px;';

    const controlStyle =
        'display: flex;' +
        'align-items: center;' +
        'font-size: 16px;';
    const inputStyle =
        'margin-left: 5px;' +
        'border: 1px solid #dadcde;' +
        'border-radius: 8px;' +
        'padding: 8px 16px;' +
        'font-size: 16px;';
    const textInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 180px;';
    const numberInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 90px;';
    const checkboxInputStyle =
        'margin-left: 5px;' +
        'width: 22px;' +
        'height: 22px;';

    const nameFilterDiv =
        createSearchFilterControl(nameFilter, styleStringToObject(controlStyle), styleStringToObject(textInputStyle));

    const minReviewsDiv =
        createMinReviewsFilterControl(minReviewsFilter, styleStringToObject(controlStyle), styleStringToObject(numberInputStyle));

    const minRatingDiv =
        createMinRatingFilterControl(minRatingFilter, styleStringToObject(controlStyle), styleStringToObject(numberInputStyle));

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, styleStringToObject(controlStyle), styleStringToObject(checkboxInputStyle));

    filtersContainer.append(
        nameFilterDiv, minReviewsDiv, minRatingDiv, filterEnabledDiv,
    );

    parentNode.parentNode.insertBefore(filtersContainer, parentNode);
}

function cleanList() {
    const productCards = getAllElements(`${PRODUCT_LIST_SELECTOR} > div`);

    productCards.forEach(
        (productCard) => {
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
        },
    );
}
