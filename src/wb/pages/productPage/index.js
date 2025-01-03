import { waitForElement } from '../../../common/dom/utils';
import { getFirstElement } from '../../../common/dom/helpers';
import { appendPriceHistory } from '../../../common/priceHistory/manipulation';
import { getPriceSpan, getProductArticleFromPathname } from '../common';
import { ATTRIBUTES } from '../../../common/priceHistory/attributes';
import { SELECTORS } from './selectors';

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

async function appendPriceHistoryIfNeeded(priceContainer, priceSpan, productArticle) {
    const priceContainerWrap = priceContainer.parentNode;

    if (priceContainerWrap.hasAttribute(ATTRIBUTES.APPEND_PRICE_HISTORY_PASSED)) return;

    await appendPriceHistory(priceContainer, priceSpan, productArticle);

    priceContainerWrap.setAttribute(ATTRIBUTES.APPEND_PRICE_HISTORY_PASSED, '');
}
