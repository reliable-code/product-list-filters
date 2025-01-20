import { createDiv, createSpan } from '../dom/factories/elements';
import { getElementInnerNumber } from '../dom/helpers';
import { getStorageValue, setStorageValueAsync } from '../storage';
import { ProductData } from '../models/productData';
import { RatedProductData } from '../models/ratedProductData';
import { PriceData } from '../models/priceData';
import { DatedValue } from '../models/datedValue';
import { getDateMonthsAgo, getDateTimestamp, getLocalDateFromTimestamp } from '../dateUtils';
import { createTableWithHeaders, createTd, createTr } from '../dom/factories/table';
import { getDeviationColor } from './helpers';
import { createAndShowModal } from '../dom/factories/modal';
import { getMedian } from '../mathUtils';
import { getFormattedPriceInRUB as getFormattedPrice } from '../priceUtils';
import { createChart } from '../dom/factories/chart';

export async function appendPriceHistory(
    priceContainer, priceSpan, productArticle, skipUpdate = false,
) {
    const currentPriceValue = getElementInnerNumber(priceSpan, true);
    if (!currentPriceValue) return null;

    const productStorageKey = `product-${productArticle}`;
    const storedProduct = getStorageValue(productStorageKey);
    let currentProduct = getCurrentProduct(storedProduct);

    const lowestPriceKey = 'lowestPrice';
    const highestPriceKey = 'highestPrice';

    currentProduct =
        updateAndAppendStoredPrice(
            currentProduct,
            lowestPriceKey,
            currentPriceValue,
            (storedPrice) => currentPriceValue <= storedPrice.value,
            skipUpdate,
            'Мин. цена',
            '#d6f5b1',
            priceContainer,
        );

    currentProduct =
        updateAndAppendStoredPrice(
            currentProduct,
            highestPriceKey,
            currentPriceValue,
            (storedPrice) => currentPriceValue >= storedPrice.value,
            skipUpdate,
            'Макс. цена',
            '#fed2ea',
            priceContainer,
        );

    if (!skipUpdate) {
        currentProduct = updatePriceHistory(currentProduct, currentPriceValue);
    }

    currentProduct.updateLastCheckDate();

    const {
        lowestPriceValue,
        highestPriceValue,
    } = currentProduct;

    await setStorageValueAsync(productStorageKey, currentProduct);

    return new PriceData(currentPriceValue, lowestPriceValue, highestPriceValue);
}

function getCurrentProduct(storedProduct) {
    if (!storedProduct) return new ProductData();

    return storedProduct.rating
        ? RatedProductData.fromObject(storedProduct)
        : ProductData.fromObject(storedProduct);
}

function updateAndAppendStoredPrice(
    product,
    priceKey,
    currentPriceValue,
    compareCondition,
    skipUpdate,
    label,
    color,
    priceContainer,
) {
    if (currentPriceValue || product[priceKey]) {
        if (!skipUpdate) {
            updateStoredPriceIfNeeded(product, priceKey, currentPriceValue, compareCondition);
        }
        const { priceHistory } = product;
        appendStoredPrice(label, product[priceKey], color, priceHistory, currentPriceValue, priceContainer);
        return product;
    }
    return product;
}

function updateStoredPriceIfNeeded(product, priceKey, currentPriceValue, compareCondition) {
    const storedPrice = product[priceKey];
    if (!currentPriceValue || (storedPrice && !compareCondition(storedPrice))) return;

    product[priceKey] = new DatedValue(currentPriceValue);
}

function appendStoredPrice(
    label, storedPrice, color, priceHistory, currentPrice, priceContainer,
) {
    const divContent = `${label}: `;
    const divStyle = {
        color: '#000',
        fontSize: '16px',
        padding: '17px 0px 7px',
    };
    const storedPriceContainer = createDiv(divStyle, divContent);

    const spanText = getFormattedPrice(storedPrice.value);
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
        // priceHistory = generateTestData(100, currentPrice);
        showPriceHistoryInModal(priceHistory, currentPrice);
    });

    storedPriceContainer.append(storedPriceSpan);
    priceContainer.parentNode.append(storedPriceContainer);
}

function showPriceHistoryInModal(priceHistory, currentPrice) {
    const tableStyles = {
        width: '100%',
        borderCollapse: 'collapse',
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
    const tbody = table.tBodies[0];

    const priceValues = [];
    const labels = [];
    const lowestPrices = [];
    const highestPrices = [];
    const sixMonthsAgo = getDateMonthsAgo(6);

    Object.entries(priceHistory)
        .forEach(([timestamp, {
            lowest,
            highest,
        }]) => {
            const date = new Date(+timestamp);
            const localDate = date.toLocaleDateString();

            if (date >= sixMonthsAgo) {
                priceValues.push(lowest, highest);
                labels.push(localDate);
                lowestPrices.push(lowest);
                highestPrices.push(highest);
            }

            const rowContent = [localDate, lowest, highest];

            const row = createTr(rowStyles);

            rowContent.forEach((content, index) => {
                const cell = createTd(cellStyles, content);

                if (index !== 0) {
                    cell.style.background = getDeviationColor(content, currentPrice);
                }

                row.appendChild(cell);
            });

            tbody.insertBefore(row, tbody.firstChild);
        });

    const modalContent = createDiv();

    const medianPrice = getMedian(priceValues);
    const headerDiv = createHeader(currentPrice, medianPrice);

    const chartContainer = createPriceChart(labels, lowestPrices, highestPrices, currentPrice);

    modalContent.appendChild(headerDiv);
    modalContent.appendChild(chartContainer);
    modalContent.appendChild(table);

    createAndShowModal(modalContent);
}

function createHeader(currentPrice, medianPrice) {
    const headerStyles = {
        display: 'flex',
        justifyContent: 'center',
        gap: '70px',
        marginBottom: '10px',
        fontSize: '20px',
    };

    const currentPriceSpan =
        createSpan(
            {}, `Текущая цена: <b>${getFormattedPrice(currentPrice)}</b>`,
        );
    const medianPriceSpan =
        createSpan(
            {}, `Медиана за 6 мес: <b>${getFormattedPrice(medianPrice)}</b>`,
        );

    const headerDiv = createDiv(headerStyles);
    headerDiv.append(currentPriceSpan, medianPriceSpan);

    return headerDiv;
}

function createPriceChart(labels, lowestPrices, highestPrices, currentPrice) {
    const type = 'line';

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Мин. цена',
                data: lowestPrices,
                borderColor: 'hsl(90, 100%, 35%)',
                fill: false,
            },
            {
                label: 'Макс. цена',
                data: highestPrices,
                borderColor: 'hsl(0, 100%, 35%)',
                fill: false,
                hidden: true,
            },
        ],
    };

    const chartOptions = {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxHeight: 1,
                    font: {
                        size: 15,
                    },
                },
            },
            annotation: {
                annotations: {
                    baseLine: {
                        type: 'line',
                        scaleID: 'y',
                        value: currentPrice,
                        borderColor: '#4872D8',
                        borderWidth: 3,
                    },
                },
            },
        },
    };

    const containerStyles = {
        width: 'calc(60vw - 60px)',
        height: '45vh',
        marginBottom: '30px',
    };
    const chartContainer = createChart(type, chartData, chartOptions, containerStyles);

    return chartContainer;
}

function updatePriceHistory(currentProduct, currentPriceValue) {
    const { priceHistory } = currentProduct;
    const currentDate = getDateTimestamp();
    const currentDatePriceHistory = priceHistory[currentDate] || {};

    const lowestPrice = Math.min(
        currentDatePriceHistory.lowest ?? currentPriceValue, currentPriceValue,
    );
    const highestPrice = Math.max(
        currentDatePriceHistory.highest ?? currentPriceValue, currentPriceValue,
    );

    currentProduct.priceHistory[currentDate] = {
        lowest: lowestPrice,
        highest: highestPrice,
    };

    return currentProduct;
}

// todo: Determine "good price" based on price history (3-6 months)
export function determineIfGoodPrice(priceTolerancePercent, priceData) {
    const priceToleranceFactor = 1 + (priceTolerancePercent / 100);
    const goodPrice = priceData.lowest * priceToleranceFactor;

    return priceData.current <= goodPrice;
}

export function highlightIfGoodPrice(isGoodPrice, priceInfoContainer) {
    if (isGoodPrice) {
        applyGoodPriceStyles(priceInfoContainer);
    } else {
        removeGoodPriceStyles(priceInfoContainer);
    }
}

function applyGoodPriceStyles(priceWrapContainer) {
    priceWrapContainer.style.border = '3px solid rgb(214, 245, 177)';
    priceWrapContainer.style.borderRadius = '14px';
    priceWrapContainer.style.padding = '4px 10px 6px';
    priceWrapContainer.style.marginBottom = '5px';
    priceWrapContainer.style.width = '-webkit-fill-available';
}

function removeGoodPriceStyles(priceWrapContainer) {
    const stylePropertiesToRemove = ['border', 'borderRadius', 'padding', 'marginBottom', 'width'];
    stylePropertiesToRemove.forEach(
        (property) => priceWrapContainer.style.removeProperty(property),
    );
}
