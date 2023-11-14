import {
    defineElementOpacity,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    resetElementOpacity,
} from '../common/dom';
import { StorageValue } from '../common/storage';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createFilterControlCheckbox,
    createMinRatingFilterControl,
    createNoRatingFilterControl,
    isLessThanFilter,
} from '../common/filter';

const CATEGORY_NAME = getCategoryName();

const minRatingFilter =
    new StorageValue(`${CATEGORY_NAME}-min-rating-filter`);
const noRatingFilter =
    new StorageValue(`${CATEGORY_NAME}-no-rating-filter`, false);
const filterEnabled =
    new StorageValue(`${CATEGORY_NAME}-filter-enabled`, true);
const discountEnabled =
    new StorageValue('discount-enabled', true);

const PRODUCT_CARD_LIST_SELECTOR = '.catalog-list';
const PRODUCT_CARD_SELECTOR = '.catalog-grid_new__item';
const PRODUCT_CARD_RATING_SELECTOR = '.rating-number';

const DISCOUNTED_PRICE_ADDED_CLASS = 'discountedPriceAdded';
const CURRENT_DISCOUNT = 0.25;

function getCategoryName() {
    const { pathname } = window.location;
    const pathElements = pathname.split('/');
    const lastPathElement = pathElements.pop();
    const categoryName =
        /^\d+$/.test(lastPathElement) ? lastPathElement : 'common';

    return categoryName;
}

setInterval(initListClean, 100);

function initListClean() {
    const productCardList = getFirstElement(PRODUCT_CARD_LIST_SELECTOR);

    if (productCardList) {
        appendFilterControlsIfNeeded(productCardList, appendFiltersContainer);

        cleanList();
    }
}

function appendFiltersContainer(filtersContainer, parentNode) {
    filtersContainer.style =
        'display: flex;' +
        'grid-gap: 15px;' +
        'margin-left: 10px;';

    const controlStyle =
        'display: flex;' +
        'align-items: center;';
    const numberInputStyle =
        'border: 1px solid #C9C9C9;' +
        'border-radius: 8px;' +
        'height: 40px;' +
        'padding: 0 16px;';
    const checkboxInputStyle =
        'border: 1px solid #C9C9C9;' +
        'border-radius: 4px;' +
        'width: 22px;' +
        'height: 22px;';

    const minRatingDiv =
        createMinRatingFilterControl(minRatingFilter, controlStyle, numberInputStyle);

    const noRatingDiv =
        createNoRatingFilterControl(noRatingFilter, controlStyle, checkboxInputStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    const discountEnabledDiv =
        createFilterControlCheckbox('Скидка:', discountEnabled, controlStyle, checkboxInputStyle);

    filtersContainer.append(minRatingDiv, noRatingDiv, filterEnabledDiv, discountEnabledDiv);

    parentNode.prepend(filtersContainer);
}

function expandProductCardName(productCard) {
    const productCardName = getFirstElement('.lu-product-card-name_new', productCard);
    if (!productCardName) return;
    productCardName.style.display = 'inline-block';
    productCardName.style.height = '91px';
}

function cleanList() {
    const productCards = getAllElements(PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
            expandProductCardName(productCard);

            if (discountEnabled.value) {
                addDiscountedPriceIfNeeded(productCard);
            }

            if (!filterEnabled.value) {
                resetElementOpacity(productCard);

                return;
            }

            const productCardRating = getFirstElement(PRODUCT_CARD_RATING_SELECTOR, productCard);

            if (!productCardRating) {
                defineElementOpacity(productCard, !noRatingFilter.value);

                return;
            }

            const productCardRatingNumber = getElementInnerNumber(productCardRating);

            const conditionToDefine =
                isLessThanFilter(productCardRatingNumber, minRatingFilter.value);
            defineElementOpacity(productCard, conditionToDefine);
        },
    );
}

function addDiscountedPriceIfNeeded(productCard) {
    const productCardPrice = getFirstElement('.main-price:not(.__accent)', productCard);

    if (!productCardPrice) return;

    if (productCardPrice.classList.contains(DISCOUNTED_PRICE_ADDED_CLASS)) return;

    addDiscountedPrice(productCardPrice);
}

function addDiscountedPrice(productCardPrice) {
    const productCardPriceNumber =
        getElementInnerNumber(productCardPrice, true, true);

    const discountedPrice = productCardPriceNumber * (1 - CURRENT_DISCOUNT);

    const newProductCardPriceText =
        `${productCardPriceNumber.toFixed()} (${discountedPrice.toFixed()}) ₽`;
    productCardPrice.innerText = newProductCardPriceText;

    productCardPrice.classList.add(DISCOUNTED_PRICE_ADDED_CLASS);
}
