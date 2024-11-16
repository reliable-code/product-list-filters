import { getElementInnerNumber, getFirstElement } from '../../../common/dom';

export function appendPriceHistory(priceContainer, priceSelector, productArticle) {
    const priceSpan = getFirstElement(priceSelector, priceContainer);
    const currentPriceValue = getElementInnerNumber(priceSpan, true);

    console.log(currentPriceValue);
    console.log(productArticle);
}

