import { createDiv, createSpan } from '../dom/elementsFactory';
import { CURRENT_PRICE_ATTR, GOOD_PRICE_ATTR, LOWEST_PRICE_ATTR } from './constants';

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
