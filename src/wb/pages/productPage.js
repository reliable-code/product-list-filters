import { waitForElement } from '../../common/dom/utils';
import { getURLPathElementEnding } from '../../common/url';
import { getFirstElement } from '../../common/dom/helpers';
import { APPEND_PRICE_HISTORY_PASSED_ATTR } from '../../common/priceHistory/constants';
import { appendPriceHistory } from '../../common/priceHistory/manipulation';

const SIDE_CONTAINER_SELECTOR = '.product-page__aside-container';
const PRICE_CONTAINER_SELECTOR = '.price-block__content';
const PRICE_SELECTOR = '.price-block__price';

export async function initProductPageMods() {
    await initAppendPriceHistory();
}

async function initAppendPriceHistory() {
    const sideContainer = await waitForElement(document, `${SIDE_CONTAINER_SELECTOR}`);
    if (!sideContainer) return;

    const productArticle = getProductArticleFromPathname();
    const priceContainer = getFirstElement(PRICE_CONTAINER_SELECTOR, sideContainer);

    if (!priceContainer) return;

    const priceSpan = getFirstElement(PRICE_SELECTOR, priceContainer);

    if (!priceSpan) return;

    await appendPriceHistoryIfNeeded(priceContainer, priceSpan, productArticle);
}

async function appendPriceHistoryIfNeeded(priceContainer, priceSpan, productArticle) {
    const priceContainerWrap = priceContainer.parentNode;

    if (priceContainerWrap.hasAttribute(APPEND_PRICE_HISTORY_PASSED_ATTR)) return;
    priceContainerWrap.setAttribute(APPEND_PRICE_HISTORY_PASSED_ATTR, '');

    await appendPriceHistory(priceContainer, priceSpan, productArticle);
}

function getProductArticleFromPathname() {
    return getURLPathElementEnding(2, 'unknown');
}
