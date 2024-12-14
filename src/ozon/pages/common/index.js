import { heartStrikeDislikeIcon } from './icons';
import { getPathnameElementEnding } from '../../../common/url';
import { createLink, createSpan } from '../../../common/dom/factories/elements';
import { addGlobalStyle } from '../../../common/dom/manipulation';
import { getFirstElement } from '../../../common/dom/helpers';

export const SELECTORS = {
    SEARCH_RESULTS_SORT: '[data-widget="searchResultsSort"]',
    PRODUCT_CARDS: '.widget-search-result-container > div > div.tile-root',
    PRODUCT_CARD_NAME: '.tsBody500Medium',
};

const INPUT_STYLE =
    'margin-left: 5px;' +
    'border: 2px solid #b3bcc5;' +
    'border-radius: 6px;' +
    'padding: 6px 10px;';
export const NUMBER_INPUT_STYLE =
    INPUT_STYLE + // eslint-disable-line prefer-template
    'width: 75px;';
export const TEXT_INPUT_STYLE =
    INPUT_STYLE + // eslint-disable-line prefer-template
    'width: 180px;';
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

export function createDislikeButton(onClick, needLabel = true) {
    const style = {
        display: 'inline-flex',
        alignItems: 'center',
        marginLeft: 'auto',
        color: 'rgba(0, 26, 52, 0.6)',
        cursor: 'pointer',
    };

    const productDislikeButton = createLink(style, heartStrikeDislikeIcon);

    productDislikeButton.onclick = () => {
        if (window.confirm('Выставить низкий рейтинг?')) {
            onClick();
        }
    };

    if (needLabel) {
        const productDislikeButtonSpan =
            createSpan({ paddingLeft: '8px' }, 'Дизлайк');
        productDislikeButton.append(productDislikeButtonSpan);
    }

    return productDislikeButton;
}

export function setCommonFiltersContainerStyles(filtersContainer, parentNode) {
    addInputSpinnerButtons();

    filtersContainer.style =
        'display: flex;' +
        'flex-flow: wrap;' +
        'grid-gap: 15px;' +
        'min-width: 1250px;';

    parentNode.style =
        'position: sticky;' +
        'top: 2px;' +
        'background-color: #fff;' +
        'z-index: 2;' +
        'padding-bottom: 11px;' +
        'margin-bottom: 0;' +
        'gap: 15px;';
}

function addInputSpinnerButtons() {
    addGlobalStyle(
        'input[type=number]::-webkit-inner-spin-button,' +
        'input[type=number]::-webkit-outer-spin-button {' +
        '    -webkit-appearance: auto;' +
        '}',
    );
}

export function getFirstProductCardsWrap() {
    return getFirstElement('.widget-search-result-container').firstChild;
}

export function moveProductCardsToFirstWrap(productCards, firstProductCardsWrap) {
    productCards.forEach((productCard) => {
        moveProductCardToFirstWrapIfNeeded(productCard, firstProductCardsWrap);
    });
}

export function moveProductCardToFirstWrapIfNeeded(productCard, firstProductCardsWrap) {
    if (productCard.parentNode === firstProductCardsWrap) return;

    firstProductCardsWrap.appendChild(productCard);
}

export function hideUnwantedElements() {
    const css =
        '[data-widget="bigPromoPDP"],' +
        '[data-widget="blackFridayStatus"],' +
        '[data-widget="cellList"],' +
        '[data-widget="skuGrid"],' +
        '[data-widget="skuShelfGoods"],' +
        '[data-widget="tagList"],' +
        '[data-widget="webInstallmentPurchase"],' +
        '[data-widget="webOneClickButton"] {' +
        '   display: none !important;' +
        '}';

    addGlobalStyle(css);
}
