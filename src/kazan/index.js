import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    getNodeInnerNumber,
    getURLPathElementEnding,
    hideElement,
    pathnameIncludes,
    showElement,
    showHideElement,
    waitForElement,
} from '../common/dom';
import { StoredInputValue } from '../common/localstorage';
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

    if (pathnameIncludes('category') || pathnameIncludes('search')) {
        initListClean();
    }
}).observe(documentElement, {
    attributes: true,
    attributeFilter: ['class'],
});

function initListClean() {
    waitForElement(document, '.notification')
        .then((notification) => {
            const promotional = getFirstElement('.promotional-shelf', notification);
            if (promotional) promotional.remove();

            appendFilterControlsIfNeeded(notification, appendFiltersContainer, true);

            const productCardsWrap = getFirstElement('#category-products', document, true);
            new MutationObserver(cleanList).observe(productCardsWrap, { childList: true });
        });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    initFilters();

    filtersContainer.style =
        'display: flex;' +
        'grid-gap: 11px;' +
        'margin-bottom: 17px;';

    const controlStyle =
        'display: flex;' +
        'align-items: center;' +
        'font-size: 15px;';
    const inputStyle =
        'margin-left: 5px;' +
        'border: 1px solid rgba(0,0,0,.12);' +
        'border-radius: 4px;' +
        'color: rgba(0,0,0,.87);' +
        'font-family: Roboto,sans-serif;' +
        'font-size: .875rem;' +
        'padding: 8px 11px;';
    const textInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 180px;';
    const numberInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 90px;';
    const checkboxInputStyle =
        'margin-left: 5px;' +
        'width: 23px;' +
        'height: 23px;';

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
    const categoryName = getURLPathElementEnding(2);

    nameFilter =
        new StoredInputValue(`${categoryName}-name-filter`, null, cleanList);
    minReviewsFilter =
        new StoredInputValue(`${categoryName}-min-reviews-filter`, null, cleanList);
    minRatingFilter =
        new StoredInputValue(`${categoryName}-min-rating-filter`, 4.8, cleanList);
    filterEnabled =
        new StoredInputValue(`${categoryName}-filter-enabled`, true, cleanList);
}

function cleanList() {
    const productCardsWrap = getFirstElement('#category-products', document, true);
    const productCards = getAllElements(':scope > div:not(.products-controllers)', productCardsWrap);

    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                showElement(productCard);

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
            showHideElement(productCard, conditionToHide);
        },
    );
}
