import { waitForElement } from '../../common/dom/utils';
import { appendPriceHistory } from './common/common';
import { getURLPathElementEnding } from '../../common/url';
import { getFirstElement } from '../../common/dom/helpers';

const SIDE_CONTAINER_SELECTOR = '.product-page__aside-container';
const PRICE_CONTAINER_SELECTOR = '.price-block__content';
const PRICE_SELECTOR = '.price-block__wallet-price';

export function initProductPageMods() {
    initAppendPriceHistory();
}

function initAppendPriceHistory() {
    waitForElement(document, `${SIDE_CONTAINER_SELECTOR}`)
        .then((sideContainer) => {
            if (!sideContainer) return;

            const productArticle = getProductArticleFromPathname();
            const priceContainer =
                getFirstElement(PRICE_CONTAINER_SELECTOR, sideContainer);

            const priceSpan = getFirstElement(PRICE_SELECTOR, priceContainer);
            appendPriceHistory(priceContainer, priceSpan, productArticle);
        });
}

function getProductArticleFromPathname() {
    return getURLPathElementEnding(2, 'unknown');
}
