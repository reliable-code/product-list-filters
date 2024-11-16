import { getURLPathElementEnding, waitForElement } from '../../common/dom';
import { appendPriceHistory } from './common/common';

const PRICE_CONTAINER_SELECTOR = '.price-block__content';
const PRICE_SELECTOR = '.price-block__wallet-price';

export function initProductPageMods() {
    initAppendPriceHistory();
}

function initAppendPriceHistory() {
    waitForElement(document, `${PRICE_CONTAINER_SELECTOR}`)
        .then((priceContainer) => {
            if (!priceContainer) return;

            const productArticle = getProductArticleFromPathname();
            appendPriceHistory(priceContainer, PRICE_SELECTOR, productArticle);
        });
}

function getProductArticleFromPathname() {
    return getURLPathElementEnding(2, 'unknown');
}
