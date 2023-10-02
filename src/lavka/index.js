import { insertAfter, createDefaultFilterControl, updateInput } from '../common/dom';

const MIN_DISCOUNT = 20;
const MIN_DISCOUNT_LOCAL_STORAGE_KEY = 'minDiscountFilter';

const MAIN_CONTENT_SELECTOR = '#main-content-id';
const PRODUCT_CARD_LINK_SELECTOR = '[data-type="product-card-link"]';

const minDiscountValue =
    +(localStorage.getItem(MIN_DISCOUNT_LOCAL_STORAGE_KEY) ?? MIN_DISCOUNT);

const mainContent = document.querySelector(MAIN_CONTENT_SELECTOR);

if (mainContent) {
    appendFilterControls();

    setInterval(cleanList, 500);
}

function appendFilterControls() {
    const minDiscountDiv =
        createDefaultFilterControl('Минимальная скидка: ', minDiscountValue, '1', '0', '100', updateMinDiscountInput);

    insertAfter(mainContent, minDiscountDiv);
}

function updateMinDiscountInput(e) {
    updateInput(MIN_DISCOUNT_LOCAL_STORAGE_KEY, e);
}

function cleanList() {
    if (minDiscountValue === 0) {
        return;
    }

    const productCardLinks = document.querySelectorAll(PRODUCT_CARD_LINK_SELECTOR);

    if (productCardLinks.length) {
        productCardLinks.forEach(
            (productCardLink) => {
                const productCardLinksParent = productCardLink.parentNode;
                const productCard = productCardLinksParent.parentNode.parentNode;

                const promoLabel = productCardLinksParent.querySelector('li');

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
}
