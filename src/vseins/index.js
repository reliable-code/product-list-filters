import { getFirstElement, waitForElement } from '../common/dom';
import { StorageValue } from '../common/storage';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createNameFilterControl,
} from '../common/filter';

const CATEGORY_NAME = getCategoryName();

function getCategoryName() {
    const pathElements = getPathElements();
    const categoryName = pathElements[2] ?? 'common';
    console.log(categoryName);
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
    new StorageValue(`${CATEGORY_NAME}-min-rating-filter`, 4.8, cleanList);
const filterEnabled =
    new StorageValue(`${CATEGORY_NAME}-filter-enabled`, true, cleanList);

initListClean();

function initListClean() {
    waitForElement(document, '#product-listing-top')
        .then((productListingTop) => {
            const productList = getFirstElement('[data-qa="listing"]', productListingTop, true);

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
        'margin-bottom: 17px;';

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

    parentNode.parentNode.insertBefore(filtersContainer, parentNode);
}

function cleanList() {

}
