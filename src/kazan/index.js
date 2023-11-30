import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    getNodeInnerNumber,
    hideElement,
    showElement,
    showHideElement,
    waitForElement,
} from '../common/dom';
import { StorageValue } from '../common/storage';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createNameFilterControl,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../common/filter';

let nameFilter;
let minReviewsFilter;
let minRatingFilter;
let filterEnabled;

const { documentElement } = document;
new MutationObserver(() => {
    if (documentElement.classList.contains('nprogress-busy')) return;

    const pathElements = getPathElements();
    if (pathElements.includes('category') || pathElements.includes('search')) {
        initListClean();
    }
}).observe(documentElement, {
    attributes: true,
    attributeFilter: ['class'],
});

function getPathElements() {
    const { pathname } = window.location;
    return pathname.split('/');
}

function initListClean() {
    waitForElement(document, '.notification')
        .then((notification) => {
            appendFilterControlsIfNeeded(notification, appendFiltersContainer);

            const productCardsWrap = getFirstElement('#category-products', document, true);
            new MutationObserver(cleanList).observe(productCardsWrap, { childList: true });
        });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    initFilters();

    filtersContainer.style =
        'display: flex;' +
        'grid-gap: 15px;' +
        'margin-top: 14px;';

    const controlStyle =
        'display: flex;' +
        'align-items: center;';
    const inputStyle =
        'margin-left: 5px;' +
        'border: 2px solid #b3bcc5;' +
        'border-radius: 6px;' +
        'padding: 6px 10px;';
    const textInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 190px;';
    const numberInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 90px;';
    const checkboxInputStyle =
        'margin-left: 5px;' +
        'width: 25px;' +
        'height: 25px;';

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

function initFilters() {
    const categoryName = getCategoryName();

    nameFilter =
        new StorageValue(`${categoryName}-name-filter`, null, cleanList);
    minReviewsFilter =
        new StorageValue(`${categoryName}-min-reviews-filter`, null, cleanList);
    minRatingFilter =
        new StorageValue(`${categoryName}-min-rating-filter`, 4.8, cleanList);
    filterEnabled =
        new StorageValue(`${categoryName}-filter-enabled`, true, cleanList);
}

function getCategoryName() {
    const pathElements = getPathElements();
    const categoryName = pathElements[2] ?? 'common';

    return categoryName;
}

function cleanList() {
    const productCardsWrap = getFirstElement('#category-products', document, true);
    const productCards = getAllElements(':scope > div:not(.products-controllers)', productCardsWrap);

    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                showElement(productCard, 'flex');

                return;
            }

            const productCardNameWrap =
                getFirstElement('.subtitle-item', productCard);

            const productCardRatingWrap =
                getFirstElement('.orders', productCard);

            const productCardRating =
                getFirstElement('[data-test-id="text__rating"]', productCardRatingWrap);

            if (!productCardNameWrap || !productCardRating) {
                hideElement(productCard);
                return;
            }

            const productCardName = productCardNameWrap.innerText;
            const productCardReviewsNumber =
                getNodeInnerNumber(productCardRatingWrap.childNodes[1], true);
            const productCardRatingNumber =
                getElementInnerNumber(productCardRating, true);

            const conditionToHide =
                isNotMatchTextFilter(productCardName, nameFilter) ||
                isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
                isLessThanFilter(productCardRatingNumber, minRatingFilter);
            showHideElement(productCard, conditionToHide, 'flex');
        },
    );
}
