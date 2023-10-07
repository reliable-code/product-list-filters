import {
    createFilterControlNumber,
    getAllElements,
    getFirstElement,
    insertAfter,
    updateValue,
} from '../common/dom';

const MIN_DISCOUNT = 20;
const MIN_DISCOUNT_LOCAL_STORAGE_KEY = 'minDiscountFilter';

const MAIN_CONTENT_SELECTOR = '#main-content-id';
const PRODUCT_CARD_LINK_SELECTOR = '[data-type="product-card-link"]';
const FILTERS_CONTAINER_ID = 'filtersContainer';

let minDiscountValue =
    +(localStorage.getItem(MIN_DISCOUNT_LOCAL_STORAGE_KEY) ?? MIN_DISCOUNT);

const mainContent = getFirstElement(document, MAIN_CONTENT_SELECTOR);

setInterval(initListClean, 500);

function initListClean() {
    const productCardLinks = getAllElements(document, PRODUCT_CARD_LINK_SELECTOR);

    if (productCardLinks.length) {
        appendFilterControlsIfNeeded();

        cleanList(productCardLinks);
    }
}

function appendFilterControlsIfNeeded() {
    const filtersContainer = getFirstElement(mainContent, `#${FILTERS_CONTAINER_ID}`);

    if (filtersContainer) {
        return;
    }

    appendFilterControls();
}

function appendFilterControls() {
    const filtersContainer = document.createElement('div');
    filtersContainer.id = FILTERS_CONTAINER_ID;

    const minDiscountDiv =
        createFilterControlNumber('Минимальная скидка: ', minDiscountValue, '1', '0', '100', updateMinDiscountInput);

    filtersContainer.append(minDiscountDiv);
    insertAfter(mainContent.firstChild, filtersContainer);
}

function updateMinDiscountInput(e) {
    minDiscountValue = updateValue(e, MIN_DISCOUNT_LOCAL_STORAGE_KEY);
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

            const discountValue = +promoLabelText.replace(/\D/g, '');

            if (discountValue < minDiscountValue) {
                productCard.remove();
            }
        },
    );
}
