import { waitForElement } from '../../common/dom/utils';
import { getURLPathElementEnding } from '../../common/url';
import { getFirstElement } from '../../common/dom/helpers';
import { APPEND_PRICE_HISTORY_PASSED_ATTR } from '../../common/priceHistory/constants';
import { appendPriceHistory } from '../../common/priceHistory/manipulation';

const SELECTORS = {
    SIDE_CONTAINER: '.product-page__aside-container',
    PRICE_CONTAINER: '.price-block__content',
    WALLET_PRICE: '.price-block__wallet-price',
    PRICE: '.price-block__price',
};

export async function initProductPageMods() {
    await initAppendPriceHistory();
}

async function initAppendPriceHistory() {
    const sideContainer = await waitForElement(document, SELECTORS.SIDE_CONTAINER);
    if (!sideContainer) return;

    const priceContainer = getFirstElement(SELECTORS.PRICE_CONTAINER, sideContainer);
    if (!priceContainer) return;

    const priceSpan = getPriceSpan(priceContainer, SELECTORS);
    if (!priceSpan) return;

    const productArticle = getProductArticleFromPathname();
    await appendPriceHistoryIfNeeded(priceContainer, priceSpan, productArticle);
}

function getPriceSpan(priceContainer, selectors) {
    return getFirstElement(selectors.WALLET_PRICE, priceContainer) ||
        getFirstElement(selectors.PRICE, priceContainer);
}

async function appendPriceHistoryIfNeeded(priceContainer, priceSpan, productArticle) {
    const priceContainerWrap = priceContainer.parentNode;

    if (priceContainerWrap.hasAttribute(APPEND_PRICE_HISTORY_PASSED_ATTR)) return;

    await appendPriceHistory(priceContainer, priceSpan, productArticle);

    priceContainerWrap.setAttribute(APPEND_PRICE_HISTORY_PASSED_ATTR, '');
}

function getProductArticleFromPathname() {
    return getURLPathElementEnding(2, 'unknown');
}
