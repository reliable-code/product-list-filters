import { heartStrikeDislikeIcon } from './icons';
import { getPathnameElementEnding } from '../../../common/url';
import { createLink, createSpan } from '../../../common/dom/factories/elements';
import { applyStyles, getFirstElement } from '../../../common/dom/helpers';
import { STYLES } from './styles';
import { SELECTORS } from './selectors';

export function getProductArticleFromLink(productCardLink) {
    const productCardLinkHref = productCardLink.getAttribute('href');
    return getPathnameElementEnding(productCardLinkHref, 2);
}

export function createDislikeButton(onClick, needLabel = true) {
    const productDislikeButton = createLink(STYLES.DISLIKE_BUTTON, heartStrikeDislikeIcon);

    productDislikeButton.onclick = () => {
        if (window.confirm('Выставить низкий рейтинг?')) {
            onClick();
        }
    };

    if (needLabel) {
        const productDislikeButtonSpan = createSpan(
            { paddingLeft: '8px' }, 'Дизлайк',
        );
        productDislikeButton.append(productDislikeButtonSpan);
    }

    return productDislikeButton;
}

export function setCommonFiltersContainerStyles(filtersContainer, parentNode) {
    addInputSpinnerButtons();

    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);
    applyStyles(parentNode, STYLES.FILTERS_CONTAINER_WRAP);
}

function addInputSpinnerButtons() {
    window.GM_addStyle(`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: auto;
        }
    `);
}

export function getFirstProductCardsWrap() {
    return getFirstElement(SELECTORS.PRODUCT_CARDS_WRAP);
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
    window.GM_addStyle(`
        [data-widget="bigPromoPDP"],
        [data-widget="blackFridayStatus"],
        [data-widget="cellList"],
        [data-widget="skuGrid"],
        [data-widget="skuShelfGoods"],
        [data-widget="tagList"],
        [data-widget="webInstallmentPurchase"],
        [data-widget="webOneClickButton"] {
            display: none !important;
        }
    `);
}
