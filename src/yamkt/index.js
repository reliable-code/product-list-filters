import { debounce } from '../common/dom/utils';
import { StoredInputValue } from '../common/storage/localstorage';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { isLessThanFilter } from '../common/filter/compare';
import {
    hideElement,
    insertAfter,
    showElement,
    updateElementDisplay,
} from '../common/dom/manipulation';
import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    styleStringToObject,
} from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
} from '../common/filter/factories/specificControls';

const SEARCH_CONTROLS_SELECTOR = '[data-apiary-widget-name="@search/Controls"]';

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
        createMinReviewsFilterControl(minReviewsFilter, styleStringToObject(controlStyle), styleStringToObject(numberInputStyle));

    const minRatingDiv =
        createMinRatingFilterControl(minRatingFilter, styleStringToObject(controlStyle), styleStringToObject(numberInputStyle));

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, styleStringToObject(controlStyle), styleStringToObject(checkboxInputStyle));

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

            const productCardName = getFirstElement('[data-baobab-name="title"]', productCard);
            const productCardReviewsWrap = getFirstElement('[data-auto="reviews"]', productCard);

            if (!productCardName || !productCardReviewsWrap) {
                hideElement(productCard);

                return;
            }

            const productCardReviewsNumber = getElementInnerNumber(productCardReviewsWrap.children[1], true);
            const productCardRatingNumber = getElementInnerNumber(productCardReviewsWrap.children[0], true);

            const shouldHide =
                isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
                isLessThanFilter(productCardRatingNumber, minRatingFilter);
            updateElementDisplay(productCard, shouldHide);
        },
    );
}
