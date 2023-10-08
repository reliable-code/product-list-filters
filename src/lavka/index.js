import {
    appendFilterControlsIfNeeded,
    createMinDiscountFilterControl,
    getAllElements,
    getFirstElement,
    hideElement,
    insertAfter,
    showElement,
} from '../common/dom';
import { getStorageValueOrDefault, setStorageValueFromEvent } from '../common/storage';
import { removeNonDigit } from '../common/string';

const MIN_DISCOUNT = 20;
const MIN_DISCOUNT_LOCAL_STORAGE_KEY = 'minDiscountFilter';

const MAIN_CONTENT_SELECTOR = '#main-content-id';
const PRODUCT_CARD_LINK_SELECTOR = '[data-type="product-card-link"]';

let minDiscountValue = getStorageValueOrDefault(MIN_DISCOUNT_LOCAL_STORAGE_KEY, MIN_DISCOUNT);

const mainContent = getFirstElement(document, MAIN_CONTENT_SELECTOR);

setInterval(initListClean, 500);

function initListClean() {
    const productCardLinks = getAllElements(document, PRODUCT_CARD_LINK_SELECTOR);

    if (productCardLinks.length) {
        appendFilterControlsIfNeeded(mainContent, appendFiltersContainer);

        cleanList(productCardLinks);
    }
}

function appendFiltersContainer(filtersContainer, parentNode) {
    const minDiscountDiv = createMinDiscountFilterControl(minDiscountValue, updateMinDiscountValue);

    filtersContainer.append(minDiscountDiv);
    insertAfter(parentNode.firstChild, filtersContainer);
}

function updateMinDiscountValue(e) {
    minDiscountValue = setStorageValueFromEvent(e, MIN_DISCOUNT_LOCAL_STORAGE_KEY);
}

function cleanList(productCardLinks) {
    if (minDiscountValue === 0) {
        return;
    }

    productCardLinks.forEach(
        (productCardLink) => {
            const productCardLinksParent = productCardLink.parentNode;
            const productCard = productCardLinksParent.parentNode.parentNode;

            const promoLabel = getFirstElement(productCardLinksParent, 'li');

            if (!promoLabel) {
                productCard.remove();
                return;
            }

            const promoLabelText = promoLabel.innerText;

            if (!promoLabelText.includes('%')) {
                productCard.remove();
                return;
            }

            const discountValue = +removeNonDigit(promoLabelText);

            if (discountValue < minDiscountValue) {
                hideElement(productCard);
            } else {
                showElement(productCard);
            }
        },
    );
}
