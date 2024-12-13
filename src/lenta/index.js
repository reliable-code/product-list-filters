import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { removeNonDigit } from '../common/string';
import { getURLPathElementEnding, pathnameIncludes } from '../common/url';
import { isLessThanFilter, isNotMatchTextFilter } from '../common/filter/compare';
import { createCheckboxFilterControl } from '../common/filter/factories/genericControls';
import {
    resetElementOpacity,
    resetElementOrder,
    setElementOrder,
    updateElementOpacity,
} from '../common/dom/manipulation';
import {
    applyStyles,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../common/dom/helpers';
import {
    createDiscountFilterControl,
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createNoRatingFilterControl,
    createSearchFilterControl,
} from '../common/filter/factories/specificControls';
import { STYLES } from './styles';
import { SELECTORS } from './selectors';
import { ATTRIBUTES } from './attributes';
import { createFilterFactory } from '../common/filter/factories/createFilter';

const SECTION_ID = getURLPathElementEnding(2);

const {
    createGlobalFilter,
    createSectionFilter,
} = createFilterFactory(processProductCards, SECTION_ID);

const nameFilter = createSectionFilter('name-filter');
const minRatingFilter = createSectionFilter('min-rating-filter', 4.1);
const discountAmount = createGlobalFilter('discount-amount', 25);
const noRatingFilter = createSectionFilter('no-rating-filter', false);
const filterEnabled = createSectionFilter('filter-enabled', true);
const sortEnabled = createGlobalFilter('sort-enabled', true);

setInterval(initProcessProductCards, 100);

function initProcessProductCards() {
    const productCardList = getFirstElement(SELECTORS.PRODUCT_CARD_LIST);

    if (productCardList) {
        appendFilterControlsIfNeeded(productCardList, appendFiltersContainer);
        processProductCards();
    } else if (pathnameIncludes('order')) {
        attachOrderItemsRemoveFunctionIfNeeded();
    } else if (pathnameIncludes('basket')) {
        attachBasketProductNameLink();
    }
}

function attachBasketProductNameLink() {
    const productCards = getAllElements(SELECTORS.BASKET_PRODUCT_CARD);
    productCards.forEach((productCard) => {
        const favoriteButton = getFirstElement(SELECTORS.PRODUCT_CARD_FAVORITE_BUTTON, productCard);
        const productIdAttr = favoriteButton.getAttribute('id');
        const productId = removeNonDigit(productIdAttr);
        const productLink = createProductLink(productId);
        const productCardName = getFirstElement(SELECTORS.PRODUCT_CARD_NAME, productCard);

        productCardName.addEventListener('mousedown', (event) => {
            if (event.button === 1) {
                window.open(productLink, '_blank');
            }
        });
    });
}

function createProductLink(productId) {
    return `https://lenta.com/item/${productId}`;
}

function attachOrderItemsRemoveFunctionIfNeeded() {
    const orderPage = getFirstElement(SELECTORS.ORDER_PAGE);

    if (!orderPage) return;

    const orderItems = getAllElements(SELECTORS.ORDER_ITEM, orderPage);
    orderItems.forEach((orderItem) => {
        const orderItemWrap = orderItem.parentNode;
        orderItemWrap.onclick = () => orderItemWrap.remove();
    });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);

    const nameFilterDiv = createSearchFilterControl(
        nameFilter, STYLES.CONTROL, STYLES.TEXT_INPUT,
    );
    const minRatingDiv = createMinRatingFilterControl(
        minRatingFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const discountAmountDiv = createDiscountFilterControl(
        'Скидка: ', discountAmount, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const noRatingDiv = createNoRatingFilterControl(
        noRatingFilter, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );
    const sortEnabledDiv = createCheckboxFilterControl(
        'Сортировка:', sortEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );

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

function processProductCards() {
    const pagination = getFirstElement(SELECTORS.PAGINATION);

    if (pagination) setElementOrder(pagination, 99999);

    const productCards = getAllElements(SELECTORS.PRODUCT_CARD);

    productCards.forEach(processProductCard);
}

function processProductCard(productCard) {
    const productCardName = getAndExpandProductCardName(productCard);

    const productCardPrice = getFirstElement(SELECTORS.MAIN_PRICE, productCard, true);
    if (!productCardPrice) return;

    const priceValue = getPriceValueAttribute(productCard, productCardPrice);

    let discountedPriceValue;
    let discountAttributeChanged = false;

    if (discountAmount.value !== null) {
        discountAttributeChanged = setDiscountAttributesIfNeeded(
            productCard, productCardPrice, priceValue,
        );
        discountedPriceValue = productCard.getAttribute(ATTRIBUTES.DISCOUNTED_PRICE);
    }

    setRoundedPriceIfNeeded(
        productCardPrice, priceValue, discountedPriceValue, discountAttributeChanged,
    );

    if (sortEnabled.value) {
        const productCardOrder = discountedPriceValue || priceValue;
        setElementOrder(productCard, productCardOrder);
    } else {
        resetElementOrder(productCard);
    }

    if (!filterEnabled.value) {
        resetElementOpacity(productCard);
        return;
    }

    const productCardRating = getFirstElement(SELECTORS.PRODUCT_CARD_RATING, productCard);

    const minRatingIsNotMatchFilter =
        productCardRating ?
            isLessThanFilter(getElementInnerNumber(productCardRating), minRatingFilter) :
            !noRatingFilter.value;

    const shouldSetOpacity =
        isNotMatchTextFilter(productCardName, nameFilter) ||
        minRatingIsNotMatchFilter;
    updateElementOpacity(productCard, shouldSetOpacity);
}

function getAndExpandProductCardName(productCard) {
    const productCardNameWrap =
        getFirstElement(SELECTORS.PRODUCT_CARD_NAME_WRAPPER, productCard);

    if (!productCardNameWrap) return '';

    expandProductCardName(productCardNameWrap);

    return productCardNameWrap.innerText;
}

function expandProductCardName(productCardNameWrap) {
    const newHeight = '72px';
    productCardNameWrap.style.height = newHeight;
    productCardNameWrap.firstChild.style.height = newHeight;
}

function getPriceValueAttribute(productCard, productCardPrice) {
    if (!productCard.hasAttribute(ATTRIBUTES.PRICE)) {
        addPriceAttribute(productCard, productCardPrice);
    }

    return productCard.getAttribute(ATTRIBUTES.PRICE);
}

function addPriceAttribute(productCard, productCardPrice) {
    const priceValue =
        getElementInnerNumber(productCardPrice, true, true);

    productCard.setAttribute(ATTRIBUTES.PRICE, priceValue.toFixed());
}

function setDiscountAttributesIfNeeded(productCard, productCardPrice, priceValue) {
    if (productCardPrice.classList.contains('__accent')) return false;

    if (productCard.hasAttribute(ATTRIBUTES.DISCOUNT)) {
        const lastDiscountValue = +productCard.getAttribute(ATTRIBUTES.DISCOUNT);

        if (lastDiscountValue === discountAmount.value) return false;
    }

    if (discountAmount.value === 0) {
        productCard.removeAttribute(ATTRIBUTES.DISCOUNT);
        productCard.removeAttribute(ATTRIBUTES.DISCOUNTED_PRICE);
    } else {
        setDiscountAttribute(productCard);
        setDiscountedPriceAttribute(productCard, priceValue);
    }

    return true;
}

function setDiscountAttribute(productCard) {
    productCard.setAttribute(ATTRIBUTES.DISCOUNT, discountAmount.value);
}

function setDiscountedPriceAttribute(productCard, priceValue) {
    const discountedPrice = (priceValue * ((100 - discountAmount.value) / 100)).toFixed();
    productCard.setAttribute(ATTRIBUTES.DISCOUNTED_PRICE, discountedPrice);
}

function setRoundedPriceIfNeeded(
    productCardPrice, priceValue, discountedPriceValue, discountAttributeChanged,
) {
    if (!discountAttributeChanged && productCardPrice.hasAttribute(ATTRIBUTES.PRICE_ROUNDED)) {
        return;
    }

    const priceText = getPriceText(discountedPriceValue, priceValue);

    productCardPrice.innerText = priceText;
    productCardPrice.setAttribute(ATTRIBUTES.PRICE_ROUNDED, '');
}

function getPriceText(discountedPriceValue, priceValue) {
    if (discountedPriceValue) {
        return `${priceValue} (${discountedPriceValue}) ₽`;
    }

    return `${priceValue} ₽`;
}
