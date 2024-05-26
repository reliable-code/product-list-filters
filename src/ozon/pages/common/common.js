import {
    addGlobalStyle,
    createDiv,
    createLink,
    createSpan,
    getFirstElement,
    getNodeInnerNumber,
    getPathnameElementEnding,
} from '../../../common/dom';
import { getStorageValue, setStorageValue } from '../../../common/storage';
import { DatedValue } from '../../../common/models/datedValue';
import { heartStrikeDislikeIcon } from './icons';
import { PriceData } from '../../models/priceData';

export const PRODUCT_CARDS_SELECTOR = '.widget-search-result-container > div > div';

export const CONTROL_STYLE =
    'display: flex;' +
    'align-items: center;';

export const CHECKBOX_INPUT_STYLE =
    'margin-left: 5px;' +
    'width: 25px;' +
    'height: 25px;';

export function getProductArticleFromLink(productCardLink) {
    const productCardLinkHref = productCardLink.getAttribute('href');
    return getPathnameElementEnding(productCardLinkHref, 2);
}

export function appendPriceHistory(priceContainer, productArticle) {
    const priceSpan = getFirstElement('span', priceContainer);
    const currentPriceValue = getNodeInnerNumber(priceSpan, true);

    const lowestPriceValue = appendStoredPriceValue(
        productArticle,
        'lp',
        (storedPrice) => currentPriceValue <= storedPrice.value,
        currentPriceValue,
        'Мин. цена',
        '#d6f5b1',
        priceContainer,
    );

    const highestPriceValue = appendStoredPriceValue(
        productArticle,
        'hp',
        (storedPrice) => currentPriceValue >= storedPrice.value,
        currentPriceValue,
        'Макс. цена',
        '#fed2ea',
        priceContainer,
    );

    return new PriceData(currentPriceValue, lowestPriceValue, highestPriceValue);
}

function appendStoredPriceValue(
    productArticle, postfix, compareCondition, currentPriceValue, label, color, priceContainer,
) {
    const storageKey = `${productArticle}-${postfix}`;
    let storedPrice = getStorageValue(storageKey);

    if (!currentPriceValue) {
        if (!storedPrice) return 0;
    } else if (!storedPrice || compareCondition(storedPrice)) {
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

    return storedPrice.value;
}

export function createDislikeButton(onClick, needLabel = true) {
    const style =
        'display: inline-flex;' +
        'align-items: center;' +
        'margin-left: auto;' +
        'color: rgba(0, 26, 52, 0.6);' +
        'cursor: pointer;';

    const productDislikeButton =
        createLink(
            null,
            heartStrikeDislikeIcon,
            style,
        );

    productDislikeButton.onclick = () => {
        if (window.confirm('Выставить низкий рейтинг?')) {
            onClick();
        }
    };

    if (needLabel) {
        const productDislikeButtonSpan = createSpan('Дизлайк', 'padding-left: 8px;');
        productDislikeButton.append(productDislikeButtonSpan);
    }

    return productDislikeButton;
}

export function setStoredRatingValue(productArticle, ratingValue) {
    setStorageValue(`${productArticle}-rate`, ratingValue);
}

export function getStoredRatingValue(productArticle) {
    return getStorageValue(`${productArticle}-rate`);
}

export function addInputSpinnerButtons() {
    addGlobalStyle(
        'input[type=number]::-webkit-inner-spin-button,' +
        'input[type=number]::-webkit-outer-spin-button {' +
        '    -webkit-appearance: auto;' +
        '}',
    );
}

export function setFiltersContainerStyle(filtersContainer) {
    filtersContainer.style =
        'display: flex;' +
        'flex-flow: wrap;' +
        'grid-gap: 15px;';
}
