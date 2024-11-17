import { getFirstElement, waitForElement } from '../../common/dom/dom';
import { appendPriceHistory } from './common/common';
import { getURLPathElementEnding } from '../../common/url';

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
                getFirstElement(`${PRICE_CONTAINER_SELECTOR}`, sideContainer);

            appendPriceHistory(priceContainer, PRICE_SELECTOR, productArticle);
        });
}

function getProductArticleFromPathname() {
    return getURLPathElementEnding(2, 'unknown');
}
