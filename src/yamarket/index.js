import {
    debounce,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    hideElement,
    insertAfter,
    showElement,
    showHideElement,
} from '../common/dom';
import { StoredInputValue } from '../common/localstorage';
import { appendFilterControlsIfNeeded } from '../common/filter/filter';
import { isLessThanFilter } from '../common/filter/compare';
import {
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
} from '../common/filter/controlsFactory';

const SEARCH_CONTROLS_SELECTOR = '[data-apiary-widget-name="@marketplace/SearchControls"]';

const CATEGORY_NAME = getCategoryName();

const minReviewsFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-reviews-filter`, null, cleanList);
const minRatingFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-rating-filter`, 4.8, cleanList);
const filterEnabled =
    new StoredInputValue(`${CATEGORY_NAME}-filter-enabled`, true, cleanList);

function getCategoryName() {
    const { pathname } = window.location;
    const pathElements = pathname.split('/');
    const categoryName = pathElements[1] ?? 'common';

    return categoryName;
}

const searchControls = getFirstElement(SEARCH_CONTROLS_SELECTOR);

if (searchControls) {
    appendFilterControlsIfNeeded(searchControls, appendFiltersContainer);

    initProductListMods();
}

export function initProductListMods() {
    cleanList();

    const searchResults = getFirstElement('[data-zone-name="searchResults"]');
    const observer = new MutationObserver(debounce(cleanList, 50));

    observer.observe(searchResults, {
        childList: true,
        subtree: true,
    });
}

function appendFiltersContainer(filterControls, parentNode) {
    filterControls.style =
        'display: flex;' +
        'gap: 15px;' +
        'padding: 0 10px 15px;' +
        'font-size: 16px;' +
        'font-weight: 500;';

    const controlStyle =
        'display: flex;' +
        'align-items: center;';
    const inputStyle =
        'margin: 0px 5px;';
    const numberInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'border-radius: 7px;' +
        'border: none;' +
        'padding: 9px 11px;' +
        'box-shadow: inset 0 0 0 1.5px #d2d0cc;';
    const checkboxInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 23px;' +
        'height: 23px;';

    const minReviewsDiv =
        createMinReviewsFilterControl(minReviewsFilter, controlStyle, numberInputStyle);

    const minRatingDiv =
        createMinRatingFilterControl(minRatingFilter, controlStyle, numberInputStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    filterControls.append(minReviewsDiv, minRatingDiv, filterEnabledDiv);

    insertAfter(parentNode, filterControls);
}

function cleanList() {
    const productCards = getAllElements('[data-apiary-widget-name="@marketfront/SerpEntity"]');

    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                showElement(productCard);

                return;
            }

            const productCardReviewsWrap = getFirstElement('[data-auto="reviews"]', productCard);
            const productCardRatingWrap = getFirstElement('[data-auto="rating"]', productCard);

            if (!productCardReviewsWrap || !productCardRatingWrap) {
                hideElement(productCard);

                return;
            }

            const productCardReviewsNumber = getElementInnerNumber(productCardReviewsWrap);
            const productCardRatingNumber = getElementInnerNumber(productCardRatingWrap);

            const conditionToHide =
                isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
                isLessThanFilter(productCardRatingNumber, minRatingFilter);
            showHideElement(productCard, conditionToHide);
        },
    );
}
