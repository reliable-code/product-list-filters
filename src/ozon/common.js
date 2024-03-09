import {
 createDiv, createSpan, getFirstElement, getNodeInnerNumber,
} from '../common/dom';
import { getStorageValue, setStorageValue } from '../common/storage';
import { DatedValue } from '../common/models/datedValue';

export const PRODUCT_CARDS_SELECTOR = '.widget-search-result-container > div > div';

export function getProductArticleFromPathname() {
    const { pathname } = window.location;
    return getProductArticleFromUrl(pathname);
}

function getProductArticleFromUrl(pathname) {
    const pathElements = pathname.split('/');
    const productLinkName = pathElements[2];

    if (!productLinkName) {
        console.log('No product article in path');
        return null;
    }

    const productArticle = productLinkName.split('-')
        .at(-1);
    return productArticle;
}

export function getProductArticleFromLink(productCardLink) {
    const productCardLinkHref = productCardLink.getAttribute('href');
    return getProductArticleFromUrl(productCardLinkHref);
}

export function appendPriceHistory(priceContainer, productArticle) {
    const priceSpan = getFirstElement('span', priceContainer);
    const currentPriceValue = getNodeInnerNumber(priceSpan, true);

    appendStoredPriceValue(
        productArticle,
        'lp',
        (storedPrice) => currentPriceValue <= storedPrice.value,
        currentPriceValue,
        'Мин. цена',
        '#d6f5b1',
        priceContainer,
    );

    appendStoredPriceValue(
        productArticle,
        'hp',
        (storedPrice) => currentPriceValue >= storedPrice.value,
        currentPriceValue,
        'Макс. цена',
        '#fed2ea',
        priceContainer,
    );
}

function appendStoredPriceValue(
    productArticle, postfix, compareCondition, currentPriceValue, label, color, priceContainer,
) {
    const storageKey = `${productArticle}-${postfix}`;
    let storedPrice = getStorageValue(storageKey);

    if (!storedPrice || compareCondition(storedPrice)) {
        const date = new Date().toLocaleDateString();
        const currentPrice = new DatedValue(currentPriceValue, date);
        setStorageValue(storageKey, currentPrice);
        storedPrice = currentPrice;
    }
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
        `background: ${color};`;
    const storedPriceSpan = createSpan(spanText, spanStyle);
    storedPriceSpan.title = storedPrice.date;

    storedPriceContainer.append(storedPriceSpan);
    priceContainer.parentNode.append(storedPriceContainer);
}
