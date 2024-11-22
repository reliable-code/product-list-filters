import { createDiv, createSpan } from '../dom/elementsFactory';
import { CURRENT_PRICE_ATTR, GOOD_PRICE_ATTR, LOWEST_PRICE_ATTR } from './constants';
import { getElementInnerNumber } from '../dom/helpers';
import { getStorageValue, setStorageValueAsync } from '../storage/storage';
import { ProductData } from '../models/productData';
import { PriceData } from '../models/priceData';
import { DatedValue } from '../models/datedValue';
import { getDateTimestamp, getLocalDateFromTimestamp } from '../dateUtils';
import { createTableWithHeaders, createTd, createTr } from '../dom/tableFactory';
import { createModal } from '../dom/modalFactory';
import { getDeviationColor } from './helpers';

export function appendPriceHistory(priceContainer, priceSpan, productArticle) {
    const currentPriceValue = getElementInnerNumber(priceSpan, true);
    if (!currentPriceValue) return Promise.resolve(null);

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

    currentProduct = updatePriceHistory(currentProduct, currentPriceValue);

    currentProduct.updateLastCheckDate();

    const {
        lowestPriceValue,
        highestPriceValue,
    } = currentProduct;

    return setStorageValueAsync(productStorageKey, currentProduct)
        .then(() => new PriceData(currentPriceValue, lowestPriceValue, highestPriceValue));
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

    const { priceHistory } = product;
    appendStoredPriceValue(
        label, storedPrice, color, priceContainer, priceHistory, currentPriceValue,
    );

    return product;
}

function appendStoredPriceValue(
    label, storedPrice, color, priceContainer, priceHistory, currentPrice,
) {
    const divContent = `${label}: `;
    const divStyle = {
        color: '#000',
        fontSize: '16px',
        padding: '17px 0px 7px',
    };
    const storedPriceContainer = createDiv(divStyle, divContent);

    const spanText = `${storedPrice.value.toLocaleString()} ₽`;
    const spanStyle = {
        fontWeight: 'bold',
        padding: '6px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        background: color,
    };
    const storedPriceSpan = createSpan(spanStyle, spanText);

    storedPriceSpan.addEventListener('mouseover', () => {
        storedPriceSpan.textContent = getLocalDateFromTimestamp(storedPrice.date);
    });
    storedPriceSpan.addEventListener('mouseleave', () => {
        storedPriceSpan.textContent = spanText;
    });

    storedPriceSpan.addEventListener('click', (event) => {
        event.stopPropagation();
        event.preventDefault();

        showPriceHistoryInModal(priceHistory, currentPrice);
    });

    storedPriceContainer.append(storedPriceSpan);
    priceContainer.parentNode.append(storedPriceContainer);
}

function showPriceHistoryInModal(priceHistory, currentPrice) {
    const modal = createModal();

    const tableStyles = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '16px',
    };
    const headerRowStyles = { borderTop: '1px solid #ccc' };
    const headerCellStyles = {
        padding: '8px',
        textAlign: 'left',
    };
    const rowStyles = { borderTop: '1px solid #ccc' };
    const cellStyles = { padding: '8px' };

    const headers = ['Дата', 'Мин. цена', 'Макс. цена'];

    const table = createTableWithHeaders(tableStyles, headerRowStyles, headerCellStyles, headers);

    Object.entries(priceHistory)
        .forEach(([timestamp, {
            lowest,
            highest,
        }]) => {
            const rowContent = [getLocalDateFromTimestamp(+timestamp), lowest, highest];

            const row = createTr(rowStyles);

            rowContent.forEach((content, index) => {
                const cell = createTd(cellStyles, content);

                if (index !== 0) {
                    cell.style.background = getDeviationColor(content, currentPrice);
                }

                row.appendChild(cell);
            });

            table.appendChild(row);
        });

    modal.appendChild(table);

    document.body.appendChild(modal);
}

function updatePriceHistory(currentProduct, currentPriceValue) {
    const { priceHistory } = currentProduct;
    const currentDate = getDateTimestamp();
    const currentDatePriceHistory = priceHistory[currentDate] || {};

    const lowestPrice =
        Math.min(currentDatePriceHistory.lowest ?? currentPriceValue, currentPriceValue);
    const highestPrice =
        Math.max(currentDatePriceHistory.highest ?? currentPriceValue, currentPriceValue);

    currentProduct.priceHistory[currentDate] = {
        lowest: lowestPrice,
        highest: highestPrice,
    };

    return currentProduct;
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
