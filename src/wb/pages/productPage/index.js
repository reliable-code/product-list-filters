import { waitForElement } from '../../../common/dom/utils';
import { getFirstElement, getFirstTextNode } from '../../../common/dom/helpers';
import { appendPriceHistory } from '../../../common/priceHistory/manipulation';
import { getPriceSpan, getProductArticleFromPathname } from '../common';
import { getStoredRatingValue } from '../../../common/db/specific';
import { SELECTORS } from './selectors';

const state = {
    productArticle: null,
    appendPriceHistoryPassed: false,
    replaceRatingPassed: false,
};

export async function initProductPageMods() {
    state.productArticle = getProductArticleFromPathname();

    await Promise.all([
        appendPriceHistoryIfNeeded(),
        replaceRatingIfNeeded(),
    ]);
}

async function appendPriceHistoryIfNeeded() {
    if (state.appendPriceHistoryPassed) return;

    await tryAppendPriceHistory();
    state.appendPriceHistoryPassed = true;
}

async function tryAppendPriceHistory() {
    const sideContainer = await waitForElement(document, SELECTORS.SIDE_CONTAINER);
    if (!sideContainer) return;

    const priceContainer = getFirstElement(SELECTORS.PRICE_CONTAINER, sideContainer);
    if (!priceContainer) return;

    const priceSpan = getPriceSpan(priceContainer, SELECTORS);
    if (!priceSpan) return;

    await appendPriceHistory(priceContainer, priceSpan, state.productArticle);
}

async function replaceRatingIfNeeded() {
    if (state.replaceRatingPassed) return;

    await tryReplaceRatingIfStored();
    state.replaceRatingPassed = true;
}

async function tryReplaceRatingIfStored() {
    const storedRating = getStoredRatingValue(state.productArticle);
    if (!storedRating) return;

    await tryReplaceRating(storedRating);
}

async function tryReplaceRating(storedRating) {
    const ratingNodeWrap = getFirstElement(SELECTORS.RATING_NODE_WRAP);
    if (!ratingNodeWrap) return;

    const ratingNode = getFirstTextNode(ratingNodeWrap);
    ratingNode.nodeValue = storedRating;
}
