import {
    getFirstElementInnerNumber,
    getURLPathElementEnding,
    waitForElement,
} from '../../common/dom';

const PRICE_BLOCK_SELECTOR = '.price-block';
const PRICE_SELECTOR = '.price-block__wallet-price';

export function initProductPageMods() {
    initAppendPriceHistory();
}

function initAppendPriceHistory() {
    waitForElement(document, `${PRICE_BLOCK_SELECTOR}`)
        .then((priceBlock) => {
            if (!priceBlock) return;

            const productArticle = getProductArticleFromPathname();
            appendPriceHistory(priceBlock, productArticle);
        });
}

function getProductArticleFromPathname() {
    return getURLPathElementEnding(2, 'unknown');
}

function appendPriceHistory(priceBlock, productArticle) {
    const price = getFirstElementInnerNumber(priceBlock, PRICE_SELECTOR, true);

    console.log(price);
    console.log(productArticle);
}
