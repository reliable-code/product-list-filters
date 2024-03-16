import {
    debounce,
    getAllElements,
    getFirstElement,
    hideElement,
    waitForElement,
} from '../../common/dom';
import {
    appendPriceHistory,
    getProductArticleFromLink,
    PRODUCT_CARDS_SELECTOR,
} from './common/common';

const PAGINATOR_SELECTOR = '[data-widget="paginator"]';
const APPEND_STORED_PRICE_VALUES_PASSED_ATTR = 'appendStoredPriceValuesPassed';

export function initAppendStoredPriceValues() {
    waitForElement(document, PAGINATOR_SELECTOR)
        .then((paginator) => {
            const observer = new MutationObserver(debounce(appendStoredPriceValues));

            observer.observe(paginator, {
                childList: true,
                subtree: true,
            });
        });
}

function appendStoredPriceValues() {
    const productCards = getAllElements(PRODUCT_CARDS_SELECTOR);

    productCards.forEach(
        (productCard) => {
            if (productCard.hasAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR)) {
                return;
            }

            const additionalInfoDiv = getFirstElement('.tsBodyControl400Small', productCard);
            if (additionalInfoDiv) {
                const notInStock = additionalInfoDiv.innerText === 'Нет в наличии';

                if (notInStock) {
                    productCard.setAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR, '');
                    return;
                }
            }

            const productCardLink =
                getFirstElement('a', productCard);

            if (!productCardLink) {
                hideElement(productCard);
                return;
            }

            const productArticle = getProductArticleFromLink(productCardLink);

            const priceContainer = productCard.children[0].children[1].children[0].children[0];

            const priceData = appendPriceHistory(priceContainer, productArticle);

            const priceContainerWrap = priceContainer.parentNode;
            priceContainerWrap.style.display = 'block';

            const priceToleranceFactor = 1.03;
            const goodPrice = priceData.lowest * priceToleranceFactor;

            if (priceData.current <= goodPrice) {
                priceContainerWrap.style.border = '3px solid rgb(214, 245, 177)';
                priceContainerWrap.style.borderRadius = '14px';
                priceContainerWrap.style.padding = '4px 10px 6px';
                priceContainerWrap.style.marginBottom = '5px';
                priceContainerWrap.style.width = '-webkit-fill-available';
            }

            productCard.setAttribute(APPEND_STORED_PRICE_VALUES_PASSED_ATTR, '');
        },
    );
}
