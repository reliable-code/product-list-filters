import {
    getAllElements,
    getFirstElement,
    hideElement,
    insertAfter,
    showElement,
    showHideElement,
} from '../common/dom';
import { StorageValue } from '../common/storage';
import { removeNonDigit } from '../common/string';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMinDiscountFilterControl,
} from '../common/filter';

const minDiscountFilter = new StorageValue('min-discount-filter', 20);
const filterEnabled = new StorageValue('filter-enabled', true);

const MAIN_CONTENT_SELECTOR = '#main-content-id';
const PRODUCT_CARD_LINK_SELECTOR = '[data-type="product-card-link"]';

const mainContent = getFirstElement(MAIN_CONTENT_SELECTOR);

setInterval(initListClean, 500);

function initListClean() {
    const productCardLinks = getAllElements(PRODUCT_CARD_LINK_SELECTOR);

    if (productCardLinks.length) {
        appendFilterControlsIfNeeded(mainContent, appendFiltersContainer);

        cleanList(productCardLinks);
    }
}

function appendFiltersContainer(filtersContainer, parentNode) {
    const minDiscountDiv =
        createMinDiscountFilterControl(minDiscountFilter);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled);

    filtersContainer.append(minDiscountDiv, filterEnabledDiv);
    insertAfter(parentNode.firstChild, filtersContainer);
}

function cleanList(productCardLinks) {
    if (minDiscountFilter.value === 0) {
        return;
    }

    productCardLinks.forEach(
        (productCardLink) => {
            const productCardLinksParent = productCardLink.parentNode;
            const productCard = productCardLinksParent.parentNode.parentNode;

            if (!filterEnabled.value) {
                showElement(productCard);

                return;
            }

            const promoLabel = getFirstElement('li', productCardLinksParent);

            if (!promoLabel) {
                hideElement(productCard);
                return;
            }

            const promoLabelText = promoLabel.innerText;

            if (!promoLabelText.includes('%')) {
                hideElement(productCard);
                return;
            }

            const discountValue = +removeNonDigit(promoLabelText);

            showHideElement(productCard, discountValue < minDiscountFilter.value);
        },
    );
}
