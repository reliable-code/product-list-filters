import { getFirstElement } from '../common/dom';
import { StorageValue } from '../common/storage';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createNameFilterControl,
} from '../common/filter';

const PRODUCT_LIST_SELECTOR = '[data-qa="listing"]';

const CATEGORY_NAME = getCategoryName();

function getCategoryName() {
    const pathElements = getPathElements();
    const categoryName = pathElements[3] ?? 'common';

    return categoryName;
}

function getPathElements() {
    const { pathname } = window.location;
    return pathname.split('/');
}

const nameFilter =
    new StorageValue(`${CATEGORY_NAME}-name-filter`, null, cleanList);
const minReviewsFilter =
    new StorageValue(`${CATEGORY_NAME}-min-reviews-filter`, null, cleanList);
const minRatingFilter =
    new StorageValue(`${CATEGORY_NAME}-min-rating-filter`, 4.5, cleanList);
const filterEnabled =
    new StorageValue(`${CATEGORY_NAME}-filter-enabled`, true, cleanList);

const productsPageList = getFirstElement('.products-page__list');

if (productsPageList) {
    initListClean();
}

function initListClean() {
    const topFilters = getFirstElement('.top-filters', productsPageList, true);
    const productList = getFirstElement('.catalog-products', productsPageList, true);

    appendFilterControlsIfNeeded(topFilters, appendFiltersContainer);

    new MutationObserver(cleanList).observe(productList, {
        childList: true,
        subtree: true,
    });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    filtersContainer.style =
        'display: flex;' +
        'grid-gap: 12px;' +
        'padding-bottom: 12px;';

    const controlStyle =
        'display: flex;' +
        'align-items: center;' +
        'font-size: 15px;';
    const inputStyle =
        'margin-left: 6px;' +
        'border: 1px solid #d9d9d9;' +
        'border-radius: 8px;' +
        'padding: 7px 14px;' +
        'font-size: 15px;';
    const textInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 180px;';
    const numberInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 90px;';
    const checkboxInputStyle =
        'margin-left: 6px;' +
        'width: 21px;' +
        'height: 21px;';

    const nameFilterDiv =
        createNameFilterControl(nameFilter, controlStyle, textInputStyle);

    const minReviewsDiv =
        createMinReviewsFilterControl(minReviewsFilter, controlStyle, numberInputStyle);

    const minRatingDiv =
        createMinRatingFilterControl(minRatingFilter, controlStyle, numberInputStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    filtersContainer.append(
        nameFilterDiv, minReviewsDiv, minRatingDiv, filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
}

function cleanList() {

}
