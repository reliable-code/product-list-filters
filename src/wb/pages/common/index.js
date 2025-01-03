import { getPathnameElement, getURLPathElementEnding } from '../../../common/url';
import { getFirstElement } from '../../../common/dom/helpers';
import { addScrollToFiltersButtonBase } from '../../../common/filter/factories/helpers';
import { STYLES } from '../../../ozon/pages/common/styles';

export function getProductArticleFromLink(productCardLink) {
    const productCardLinkHref = productCardLink.getAttribute('href');

    return getPathnameElement(productCardLinkHref, 4, '');
}

export function getPriceSpan(priceContainer, selectors) {
    return getFirstElement(selectors.WALLET_PRICE, priceContainer) ||
        getFirstElement(selectors.PRICE, priceContainer);
}

export function getProductArticleFromPathname() {
    return getURLPathElementEnding(2, 'unknown');
}

export function addScrollToFiltersButton(parentNode = document.body) {
    addScrollToFiltersButtonBase(parentNode, STYLES.SCROLL_TO_FILTERS_BUTTON);
}
