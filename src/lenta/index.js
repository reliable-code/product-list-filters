import { StoredInputValue } from '../common/storage/localstorage';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { removeNonDigit } from '../common/string';
import { getPathnameElement, getURLPathElementEnding, pathnameIncludes } from '../common/url';
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

const SECTION_ID = getURLPathElementEnding(2);

function createGlobalFilter(filterName, defaultValue = null) {
    return StoredInputValue.create(filterName, defaultValue);
}

function createSectionFilter(filterName, defaultValue = null) {
    return StoredInputValue.createWithCompositeKey(
        SECTION_ID, filterName, defaultValue,
    );
}

const nameFilter = createSectionFilter('name-filter');
const minRatingFilter = createSectionFilter('min-rating-filter', 4.1);
const discountAmount = createGlobalFilter('discount-amount', 25);
const noRatingFilter = createSectionFilter('no-rating-filter', false);
const filterEnabled = createSectionFilter('filter-enabled', true);
const sortEnabled = createGlobalFilter('sort-enabled', true);

const PRICE_ROUNDED_CLASS = 'priceRounded';

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
        productCardName.href = productLink;
    });
}

// todo: check is valid
function createProductLink(productId) {
    return `https://ekb.online.lenta.com/item/${productId}`;
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

    appendProductCardLinks(productCard);

    const productCardPrice = getFirstElement(SELECTORS.MAIN_PRICE, productCard, true);
    if (!productCardPrice) return;

    const priceValue = getPriceValueAttribute(productCard, productCardPrice);

    let discountedPriceValue;
    let discountAttributeChanged = false;

    if (discountAmount.value !== null) {
        discountAttributeChanged = setDiscountAttributesIfNeeded(
            productCard, productCardPrice, priceValue,
        );
        discountedPriceValue = productCard.getAttribute('discounted-price');
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

function appendProductCardLinks(productCard) {
    const productCardImageLink =
        getFirstElement(SELECTORS.PRODUCT_CARD_IMAGE_LINK, productCard);

    if (!productCardImageLink) return;

    const productCardImage =
        getFirstElement(SELECTORS.PRODUCT_CARD_IMAGE, productCardImageLink);

    if (!productCardImage) return;

    const productId = getPathnameElement(productCardImage.src, 7, '');
    const productCardNameLink = getFirstElement(SELECTORS.PRODUCT_CARD_NAME, productCard);
    const productLink = createProductLink(productId);

    productCardImageLink.href = productLink;
    productCardNameLink.href = productLink;
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

    const priceText = getPriceText(discountedPriceValue, priceValue);

    productCardPrice.innerText = priceText;
    productCardPrice.classList.add(PRICE_ROUNDED_CLASS);
}

function getPriceText(discountedPriceValue, priceValue) {
    if (discountedPriceValue) {
        return `${priceValue} (${discountedPriceValue}) ₽`;
    }

    return `${priceValue} ₽`;
}
