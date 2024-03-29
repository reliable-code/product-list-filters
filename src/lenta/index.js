import {
    defineElementOpacity,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    resetElementOpacity,
    resetElementOrder,
    setElementOrder,
} from '../common/dom';
import { StoredInputValue } from '../common/localstorage';
import {
    appendFilterControlsIfNeeded,
    createDiscountFilterControl,
    createEnabledFilterControl,
    createFilterControlCheckbox,
    createMinRatingFilterControl,
    createNameFilterControl,
    createNoRatingFilterControl,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../common/filter';

const CATEGORY_NAME = getCategoryName();

const nameFilter =
    new StoredInputValue(`${CATEGORY_NAME}-name-filter`, null);
const minRatingFilter =
    new StoredInputValue(`${CATEGORY_NAME}-min-rating-filter`, 4.1);
const discountAmount =
    new StoredInputValue('discount-amount', 25);
const noRatingFilter =
    new StoredInputValue(`${CATEGORY_NAME}-no-rating-filter`, false);
const filterEnabled =
    new StoredInputValue(`${CATEGORY_NAME}-filter-enabled`, true);
const sortEnabled =
    new StoredInputValue('sort-enabled', true);

const PRODUCT_CARD_LIST_SELECTOR = '.catalog-list';
const PRODUCT_CARD_SELECTOR = '.catalog-grid__item';
const PRODUCT_CARD_RATING_SELECTOR = '.rating-number';

const PRICE_ROUNDED_CLASS = 'priceRounded';

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
    } else {
        attachOrderItemsRemoveFunctionIfNeeded();
    }
}

function attachOrderItemsRemoveFunctionIfNeeded() {
    const orderPage = getFirstElement('lu-profile-order-page');

    if (!orderPage) return;

    const orderItems = getAllElements('lu-profile-order-item', orderPage);
    orderItems.forEach((orderItem) => {
        const orderItemWrap = orderItem.parentNode;
        orderItemWrap.onclick = () => orderItemWrap.remove();
    });
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

    const discountAmountDiv =
        createDiscountFilterControl(discountAmount, controlStyle, numberInputStyle);

    const noRatingDiv =
        createNoRatingFilterControl(noRatingFilter, controlStyle, checkboxInputStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    const sortEnabledDiv =
        createFilterControlCheckbox('Сортировка:', sortEnabled, controlStyle, checkboxInputStyle);

    filtersContainer.append(
        nameFilterDiv,
        minRatingDiv,
        discountAmountDiv,
        noRatingDiv,
        filterEnabledDiv,
        sortEnabledDiv,
    );

    parentNode.prepend(filtersContainer);
}

function cleanList() {
    const productCards = getAllElements(PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
            const productCardNameWrap =
                getFirstElement('.lu-product-card-name-wrapper', productCard);
            let productCardName = '';

            if (productCardNameWrap) {
                expandProductCardName(productCardNameWrap);
                productCardName = productCardNameWrap.innerText;
            }

            const productCardPrice = getFirstElement('.main-price', productCard, true);
            if (!productCardPrice) return;

            const priceValue = getPriceValueAttribute(productCard, productCardPrice);

            let discountedPriceValue;
            let discountAttributeChanged = false;

            if (discountAmount.value !== null) {
                discountAttributeChanged =
                    setDiscountAttributesIfNeeded(productCard, productCardPrice, priceValue);
                discountedPriceValue =
                    productCard.getAttribute('discounted-price');
            }

            setRoundedPriceIfNeeded(
                productCardPrice, priceValue, discountedPriceValue, discountAttributeChanged,
            );

            if (sortEnabled.value) {
                const productCardOrder =
                    discountedPriceValue ||
                    priceValue;
                setElementOrder(productCard, productCardOrder);
            } else {
                resetElementOrder(productCard);
            }

            if (!filterEnabled.value) {
                resetElementOpacity(productCard);

                return;
            }

            const productCardRating = getFirstElement(PRODUCT_CARD_RATING_SELECTOR, productCard);

            const minRatingIsNotMatchFilter =
                productCardRating ?
                    isLessThanFilter(getElementInnerNumber(productCardRating), minRatingFilter) :
                    !noRatingFilter.value;

            const conditionToDefine =
                isNotMatchTextFilter(productCardName, nameFilter) ||
                minRatingIsNotMatchFilter;
            defineElementOpacity(productCard, conditionToDefine);
        },
    );
}

function expandProductCardName(productCardNameWrap) {
    productCardNameWrap.style.height = '55px';
    productCardNameWrap.firstChild.style.height = '55px';
}

function getPriceValueAttribute(productCard, productCardPrice) {
    if (!productCard.hasAttribute('price')) {
        addPriceAttribute(productCard, productCardPrice);
    }

    return productCard.getAttribute('price');
}

function addPriceAttribute(productCard, productCardPrice) {
    const priceValue =
        getElementInnerNumber(productCardPrice, true, true);

    productCard.setAttribute('price', priceValue.toFixed());
}

function setDiscountAttributesIfNeeded(productCard, productCardPrice, priceValue) {
    if (productCardPrice.classList.contains('__accent')) return false;

    if (productCard.hasAttribute('discount')) {
        const lastDiscountValue = +productCard.getAttribute('discount');

        if (lastDiscountValue === discountAmount.value) return false;
    }

    if (discountAmount.value === 0) {
        productCard.removeAttribute('discount');
        productCard.removeAttribute('discounted-price');
    } else {
        setDiscountAttribute(productCard);
        setDiscountedPriceAttribute(productCard, priceValue);
    }

    return true;
}

function setDiscountAttribute(productCard) {
    productCard.setAttribute('discount', discountAmount.value);
}

function setDiscountedPriceAttribute(productCard, priceValue) {
    const discountedPrice = (priceValue * ((100 - discountAmount.value) / 100)).toFixed();
    productCard.setAttribute('discounted-price', discountedPrice);
}

function setRoundedPriceIfNeeded(
    productCardPrice, priceValue, discountedPriceValue, discountAttributeChanged,
) {
    if (!discountAttributeChanged && productCardPrice.classList.contains(PRICE_ROUNDED_CLASS)) {
        return;
    }

    const priceText =
        discountedPriceValue ? `${priceValue} (${discountedPriceValue}) ₽` : `${priceValue} ₽`;

    productCardPrice.innerText = priceText;

    productCardPrice.classList.add(PRICE_ROUNDED_CLASS);
}
