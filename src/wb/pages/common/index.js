import { getPathnameElement } from '../../../common/url';
import { getFirstElement } from '../../../common/dom/helpers';

export function getProductArticleFromLink(productCardLink) {
    const productCardLinkHref = productCardLink.getAttribute('href');

    return getPathnameElement(productCardLinkHref, 4, '');
}

export function getPriceSpan(priceContainer, selectors) {
    return getFirstElement(selectors.WALLET_PRICE, priceContainer) ||
        getFirstElement(selectors.PRICE, priceContainer);
}
