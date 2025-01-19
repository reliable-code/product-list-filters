import { waitForElement } from '../../../common/dom/utils';
import { getFirstElement, getFirstTextNode } from '../../../common/dom/helpers';
import { appendPriceHistory } from '../../../common/priceHistory/manipulation';
import { getPriceSpan, getProductArticleFromPathname } from '../common';
import { getStoredRatingValue } from '../../../common/db/specific';
import { SELECTORS } from './selectors';

const state = {
    productArticle: null,
    appendPriceHistoryPassed: false,
};

export async function initProductPageMods() {
    state.productArticle = getProductArticleFromPathname();

    await Promise.all([
        appendPriceHistoryIfNeeded(),
        appendRatingValue(),
    ]);
}

async function appendPriceHistoryIfNeeded() {
    if (state.appendPriceHistoryPassed) return;

    const sideContainer = await waitForElement(document, SELECTORS.SIDE_CONTAINER);
    if (!sideContainer) return;

    const priceContainer = getFirstElement(SELECTORS.PRICE_CONTAINER, sideContainer);
    if (!priceContainer) return;

    const priceSpan = getPriceSpan(priceContainer, SELECTORS);
    if (!priceSpan) return;

    await appendPriceHistory(priceContainer, priceSpan, state.productArticle);
    state.appendPriceHistoryPassed = true;
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
