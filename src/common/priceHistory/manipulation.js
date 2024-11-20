import { createDiv, createSpan } from '../dom/elementsFactory';
import { CURRENT_PRICE_ATTR, GOOD_PRICE_ATTR, LOWEST_PRICE_ATTR } from './constants';
import { getElementInnerNumber } from '../dom/helpers';
import { getStorageValue, setStorageValue } from '../storage/storage';
import { ProductData } from '../models/productData';
import { PriceData } from '../models/priceData';
import { DatedValue } from '../models/datedValue';

export function appendPriceHistory(priceContainer, priceSpan, productArticle) {
    const currentPriceValue = getElementInnerNumber(priceSpan, true);

    const productStorageKey = `product-${productArticle}`;
    const storedProduct = getStorageValue(productStorageKey);

    let currentProduct =
        storedProduct ? ProductData.fromObject(storedProduct) : new ProductData();

    const lowestPriceKey = 'lowestPrice';
    const highestPriceKey = 'highestPrice';

    currentProduct = updateAndAppendStoredPriceValue(
        currentProduct,
        lowestPriceKey,
        (storedPrice) => currentPriceValue <= storedPrice.value,
        currentPriceValue,
        'Мин. цена',
        '#d6f5b1',
        priceContainer,
    );

    currentProduct = updateAndAppendStoredPriceValue(
        currentProduct,
        highestPriceKey,
        (storedPrice) => currentPriceValue >= storedPrice.value,
        currentPriceValue,
        'Макс. цена',
        '#fed2ea',
        priceContainer,
    );

    currentProduct.updateLastCheckDate();

    setStorageValue(productStorageKey, currentProduct);

    const {
        lowestPriceValue,
        highestPriceValue,
    } = currentProduct;

    return new PriceData(currentPriceValue, lowestPriceValue, highestPriceValue);
}

function updateAndAppendStoredPriceValue(
    product, priceKey, compareCondition, currentPriceValue, label, color, priceContainer,
) {
    let storedPrice = product[priceKey];

    if (!currentPriceValue) {
        if (!storedPrice) return product;
    } else if (!storedPrice || compareCondition(storedPrice)) {
        const currentPrice = new DatedValue(currentPriceValue);
        product[priceKey] = currentPrice;
        storedPrice = currentPrice;
    }

    appendStoredPriceValue(label, storedPrice, color, priceContainer);

    return product;
}

export function appendStoredPriceValue(label, storedPrice, color, priceContainer) {
    const divText = `${label}: `;
    const divStyle =
        'color: #000;' +
        'font-size: 16px;' +
        'padding: 17px 0px 7px;';
    const storedPriceContainer = createDiv(divText, divStyle);

    const spanText = `${storedPrice.value.toLocaleString()} ₽`;
    const spanStyle =
        'font-weight: bold;' +
        'padding: 6px 12px;' +
        'border-radius: 8px;' +
        'cursor: pointer;' +
        `background: ${color};`;
    const storedPriceSpan = createSpan(spanText, spanStyle);

    storedPriceSpan.addEventListener('mouseover', () => {
        storedPriceSpan.textContent = storedPrice.date;
    });
    storedPriceSpan.addEventListener('mouseleave', () => {
        storedPriceSpan.textContent = spanText;
    });

    storedPriceContainer.append(storedPriceSpan);
    priceContainer.parentNode.append(storedPriceContainer);
}

export function checkIfGoodPrice(priceContainerWrap, productCard, priceTolerancePercentValue) {
    const currentPrice = productCard.getAttribute(CURRENT_PRICE_ATTR);
    const lowestPrice = productCard.getAttribute(LOWEST_PRICE_ATTR);

    const priceToleranceFactor = 1 + (priceTolerancePercentValue / 100);
    const goodPrice = lowestPrice * priceToleranceFactor;

    if (currentPrice <= goodPrice) {
        priceContainerWrap.style.border = '3px solid rgb(214, 245, 177)';
        priceContainerWrap.style.borderRadius = '14px';
        priceContainerWrap.style.padding = '4px 10px 6px';
        priceContainerWrap.style.marginBottom = '5px';
        priceContainerWrap.style.width = '-webkit-fill-available';

        productCard.setAttribute(GOOD_PRICE_ATTR, '');
    } else {
        const stylePropertiesToRemove =
            ['border', 'borderRadius', 'padding', 'marginBottom', 'width'];
        stylePropertiesToRemove.forEach(
            (property) => priceContainerWrap.style.removeProperty(property),
        );

        productCard.removeAttribute(GOOD_PRICE_ATTR);
    }
}
