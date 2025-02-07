import { heartStrikeDislikeIcon } from './icons';
import { getPathnameElementEnding, getURLPathElementEnding } from '../../../common/url';
import { createDiv, createLink, createSpan } from '../../../common/dom/factories/elements';
import { getFirstElement } from '../../../common/dom/helpers';
import { STYLES } from './styles';
import { SELECTORS } from './selectors';
import { addScrollToFiltersButtonBase } from '../../../common/filter/factories/helpers';
import { applyStyles, wrapElementContentWithLink } from '../../../common/dom/manipulation';

export function getProductArticleFromLink(productLink) {
    const productLinkHref = productLink.getAttribute('href');
    return getProductArticleFromLinkHref(productLinkHref);
}

export function getProductArticleFromLinkHref(productLinkHref) {
    return getPathnameElementEnding(productLinkHref, 2);
}

export function getProductArticleFromPathname() {
    return getURLPathElementEnding(2, 'unknown');
}

export function createDislikeButton(onClick, needLabel = true) {
    const productDislikeButton = createLink(STYLES.DISLIKE_BUTTON, heartStrikeDislikeIcon);

    productDislikeButton.addEventListener('click', () => {
        if (window.confirm('Выставить низкий рейтинг?')) {
            onClick();
        }
    });

    if (needLabel) {
        const productDislikeButtonSpan = createSpan(
            { paddingLeft: '8px' }, 'Дизлайк',
        );
        productDislikeButton.append(productDislikeButtonSpan);
    }

    return productDislikeButton;
}

export function setCommonFiltersContainerStyles(filtersContainer) {
    addInputSpinnerButtons();

    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);
}

export function addInputSpinnerButtons() {
    window.GM_addStyle(`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: auto;
        }
    `);
}

export function getClonedProductCardsWrap() {
    const searchResultsContainer = getFirstElement(SELECTORS.SEARCH_RESULTS_CONTAINER);
    const clonedProductCardsWrap = createDiv(STYLES.CLONED_PRODUCT_CARDS_WRAP);
    clonedProductCardsWrap.id = 'clonedProductCardsWrap';
    searchResultsContainer.parentNode.prepend(clonedProductCardsWrap);
    return clonedProductCardsWrap;
}

export function cloneProductCardsToWrap(productCards, clonedProductCardsWrap) {
    productCards.forEach((productCard) => {
        const productCardClone = productCard.cloneNode(true);
        clonedProductCardsWrap.appendChild(productCardClone);
        productCard.remove();
    });
}

export function wrapReviewsWrapContentWithLink(reviewsWrap, productLinkHref) {
    const href = `${productLinkHref}?scrollTo=comments`;
    wrapElementContentWithLink(href, reviewsWrap);
}

export function hideUnwantedElements() {
    window.GM_addStyle(`
        [data-widget="bannerCarousel"],
        [data-widget="bigPromoPDP"],
        [data-widget="blackFridayStatus"],
        [data-widget="cellList"],
        [data-widget="feedbackTile"],
        [data-widget="skuGrid"],
        [data-widget="skuShelfGoods"],
        [data-widget="tagList"],
        [data-widget="webInstallmentPurchase"],
        [data-widget="webOneClickButton"] {
            display: none !important;
        }
    `);
}

export function addScrollToFiltersButton(parentNode = document.body) {
    addScrollToFiltersButtonBase(parentNode, STYLES.SCROLL_TO_FILTERS_BUTTON);
}

export function setProductCardsPerRow(productCardsWrap, cardsPerRow) {
    productCardsWrap.style.gridTemplateColumns = `repeat(${cardsPerRow * 3}, 1fr)`;
}
