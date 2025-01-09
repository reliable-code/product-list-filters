import { waitForElement } from '../../../common/dom/utils';
import { getFirstElement, getFirstTextNode } from '../../../common/dom/helpers';
import { appendPriceHistory } from '../../../common/priceHistory/manipulation';
import { getPriceSpan, getProductArticleFromPathname } from '../common';
import { ATTRIBUTES } from '../../../common/priceHistory/attributes';
import { SELECTORS } from './selectors';
import { getStoredRatingValue } from '../../../common/db/specific';

export async function initProductPageMods() {
    await Promise.all([
        initAppendPriceHistory(),
        appendRatingValue(),
    ]);
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

async function appendRatingValue() {
    const productArticle = getProductArticleFromPathname();
    const storedRatingValue = getStoredRatingValue(productArticle);

    if (!storedRatingValue) return;

    const ratingNodeWrap = getFirstElement(SELECTORS.RATING_NODE_WRAP);
    if (!ratingNodeWrap) return;

    const ratingNode = getFirstTextNode(ratingNodeWrap);
    ratingNode.nodeValue = storedRatingValue;
}
