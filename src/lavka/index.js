import {
    getAllElements,
    getFirstElement,
    hideElement,
    insertAfter,
    showElement,
    showHideElement,
} from '../common/dom';
import { getStorageValueOrDefault, setStorageValueFromEvent } from '../common/storage';
import { removeNonDigit } from '../common/string';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMinDiscountFilterControl,
} from '../common/filter';

const MIN_DISCOUNT = 20;
const MIN_DISCOUNT_STORAGE_KEY = 'minDiscountFilter';
const FILTER_ENABLED = true;
const FILTER_ENABLED_STORAGE_KEY = 'filter-enabled';

const MAIN_CONTENT_SELECTOR = '#main-content-id';
const PRODUCT_CARD_LINK_SELECTOR = '[data-type="product-card-link"]';

let minDiscountValue = getStorageValueOrDefault(MIN_DISCOUNT_STORAGE_KEY, MIN_DISCOUNT);
let filterEnabledChecked = getStorageValueOrDefault(FILTER_ENABLED_STORAGE_KEY, FILTER_ENABLED);

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
        createMinDiscountFilterControl(minDiscountValue, updateMinDiscountValue);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabledChecked, updateFilterEnabledValue);

    filtersContainer.append(minDiscountDiv, filterEnabledDiv);
    insertAfter(parentNode.firstChild, filtersContainer);
}

function updateMinDiscountValue(e) {
    minDiscountValue = setStorageValueFromEvent(e, MIN_DISCOUNT_STORAGE_KEY);
}

function updateFilterEnabledValue(e) {
    filterEnabledChecked = setStorageValueFromEvent(e, FILTER_ENABLED_STORAGE_KEY);
}

function cleanList(productCardLinks) {
    if (minDiscountValue === 0) {
        return;
    }

    productCardLinks.forEach(
        (productCardLink) => {
            const productCardLinksParent = productCardLink.parentNode;
            const productCard = productCardLinksParent.parentNode.parentNode;

            if (!filterEnabledChecked) {
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

            showHideElement(productCard, discountValue < minDiscountValue);
        },
    );
}
