import { StoredInputValue } from '../common/storage/localstorage';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { removeNonNumber } from '../common/string';
import { getURLPathElement } from '../common/url';
import { isLessThanFilter, isNotMatchTextFilter } from '../common/filter/compare';
import { hideElement, showElement, updateElementDisplay } from '../common/dom/manipulation';
import { getAllElements, getFirstElement } from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createNameFilterControl,
} from '../common/filter/factories/specificControls';

const PRODUCTS_PAGE_LIST_SELECTOR = '.products-page__list';

const CATEGORY_NAME = getURLPathElement(3);

const nameFilter =
    new StoredInputValue(`${CATEGORY_NAME}-name-filter`, null, cleanList);
const minReviewsFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-reviews-filter`, null, cleanList);
const minRatingFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-rating-filter`, 4.5, cleanList);
const filterEnabled =
    new StoredInputValue(`${CATEGORY_NAME}-filter-enabled`, true, cleanList);

const productsPageList = getFirstElement(PRODUCTS_PAGE_LIST_SELECTOR);

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
        createMinRatingFilterControl(minRatingFilter, controlStyle, numberInputStyle, 0.5);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    filtersContainer.append(
        nameFilterDiv, minReviewsDiv, minRatingDiv, filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
}

function cleanList() {
    const productCards = getAllElements(`${PRODUCTS_PAGE_LIST_SELECTOR} .catalog-product`);

    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                showElement(productCard);

                return;
            }

            const productCardNameWrap =
                getFirstElement('.catalog-product__name', productCard);

            const productCardRatingWrap =
                getFirstElement('.catalog-product__rating', productCard);

            if (!productCardNameWrap || !productCardRatingWrap) {
                hideElement(productCard);
                return;
            }

            const productCardName = productCardNameWrap.innerText;

            const productCardReviewsNumber = getProductCardReviewsNumber(productCardRatingWrap);

            const productCardRatingNumber = +productCardRatingWrap.getAttribute('data-rating');

            const shouldHide =
                isNotMatchTextFilter(productCardName, nameFilter) ||
                isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
                isLessThanFilter(productCardRatingNumber, minRatingFilter);
            updateElementDisplay(productCard, shouldHide);
        },
    );
}

function getProductCardReviewsNumber(productCardRatingWrap) {
    const productCardReviewsText = productCardRatingWrap.textContent;
    let productCardReviewsNumber = +removeNonNumber(productCardReviewsText);

    if (productCardReviewsText.includes('k')) {
        productCardReviewsNumber *= 1000;
    }

    return productCardReviewsNumber;
}
