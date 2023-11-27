import {
    defineElementOpacity,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    resetElementOpacity,
    resetElementOrder,
    setElementOrder,
} from '../common/dom';
import { StorageValue } from '../common/storage';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createFilterControlCheckbox,
    createMinRatingFilterControl,
    createNameFilterControl,
    createNoRatingFilterControl,
    isLessThanFilter,
} from '../common/filter';

const CATEGORY_NAME = getCategoryName();

const nameFilter =
    new StorageValue(`${CATEGORY_NAME}-name-filter`, null);
const minRatingFilter =
    new StorageValue(`${CATEGORY_NAME}-min-rating-filter`, 4.1);
const noRatingFilter =
    new StorageValue(`${CATEGORY_NAME}-no-rating-filter`, false);
const filterEnabled =
    new StorageValue(`${CATEGORY_NAME}-filter-enabled`, true);
const discountEnabled =
    new StorageValue('discount-enabled', true);
const sortEnabled =
    new StorageValue('sort-enabled', true);

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
    const inputStyle =
        'margin-left: 5px;' +
        'border: 1px solid #C9C9C9;' +
        'border-radius: 8px;' +
        'height: 40px;' +
        'padding: 0 16px;';
    const textInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 170px;';
    const numberInputStyle =
        inputStyle; // eslint-disable-line prefer-template
    const checkboxInputStyle =
        'margin-left: 5px;' +
        'border: 1px solid #C9C9C9;' +
        'border-radius: 4px;' +
        'width: 22px;' +
        'height: 22px;';

    const nameFilterDiv =
        createNameFilterControl(nameFilter, controlStyle, textInputStyle);

    const minRatingDiv =
        createMinRatingFilterControl(minRatingFilter, controlStyle, numberInputStyle);

    const noRatingDiv =
        createNoRatingFilterControl(noRatingFilter, controlStyle, checkboxInputStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    const discountEnabledDiv =
        createFilterControlCheckbox('Скидка:', discountEnabled, controlStyle, checkboxInputStyle);

    const sortEnabledDiv =
        createFilterControlCheckbox('Сортировка:', sortEnabled, controlStyle, checkboxInputStyle);

    filtersContainer.append(
        nameFilterDiv,
        minRatingDiv,
        noRatingDiv,
        filterEnabledDiv,
        discountEnabledDiv,
        sortEnabledDiv,
    );

    parentNode.prepend(filtersContainer);
}

function cleanList() {
    const productCards = getAllElements(PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
            expandProductCardName(productCard);

            addPriceAttributeIfNeeded(productCard);

            if (discountEnabled.value) {
                addDiscountedPriceIfNeeded(productCard);
            }

            if (sortEnabled.value) {
                const productCardOrder = productCard.getAttribute('price');
                setElementOrder(productCard, productCardOrder);
            } else {
                resetElementOrder(productCard);
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
                isLessThanFilter(productCardRatingNumber, minRatingFilter);
            defineElementOpacity(productCard, conditionToDefine);
        },
    );
}

function expandProductCardName(productCard) {
    const productCardName = getFirstElement('.lu-product-card-name_new', productCard);

    if (!productCardName) return;

    productCardName.style.display = 'inline-block';
    productCardName.style.height = '91px';
}

function addPriceAttributeIfNeeded(productCard) {
    if (productCard.hasAttribute('price')) return;

    const productCardPrice = getFirstElement('.main-price', productCard);

    if (!productCardPrice) return;

    const productCardPriceNumber =
        getElementInnerNumber(productCardPrice, true, true);

    productCard.setAttribute('price', productCardPriceNumber.toFixed());
}

function addDiscountedPriceIfNeeded(productCard) {
    const productCardPrice = getFirstElement('.main-price:not(.__accent)', productCard);

    if (!productCardPrice) return;

    if (productCardPrice.classList.contains(DISCOUNTED_PRICE_ADDED_CLASS)) return;

    addDiscountedPrice(productCard, productCardPrice);
}

function addDiscountedPrice(productCard, productCardPrice) {
    const productCardPriceNumber = productCard.getAttribute('price');

    const discountedPrice = (productCardPriceNumber * (1 - CURRENT_DISCOUNT)).toFixed();
    productCard.setAttribute('price', discountedPrice);

    productCardPrice.innerText = `${productCardPriceNumber} (${discountedPrice}) ₽`;

    productCardPrice.classList.add(DISCOUNTED_PRICE_ADDED_CLASS);
}
