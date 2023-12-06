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
    isLessThanFilter,
} from '../common/filter';

const minDiscountFilter = new StorageValue('min-discount-filter', null, initListClean);
const filterEnabled = new StorageValue('filter-enabled', true, initListClean);

const MAIN_CONTENT_SELECTOR = '#main-content-id';
const PRODUCT_CARD_LINK_SELECTOR = '[data-type="product-card-link"]';

const mainContent = getFirstElement(MAIN_CONTENT_SELECTOR);

const observer = new MutationObserver(initListClean);
observer.observe(document.head, {
    childList: true,
});

initListClean();

function initListClean() {
    const productCardLinks = getAllElements(PRODUCT_CARD_LINK_SELECTOR);

    if (productCardLinks.length) {
        appendFilterControlsIfNeeded(mainContent, appendFiltersContainer);

        cleanList(productCardLinks);
    }
}

function appendFiltersContainer(filtersContainer, parentNode) {
    filtersContainer.style =
        'display: flex;' +
        'grid-gap: 15px;';

    const controlStyle =
        'display: flex;' +
        'align-items: center;';
    const inputStyle =
        'margin-left: 5px;' +
        'border: 2px solid #b3bcc5;' +
        'border-radius: 6px;' +
        'padding: 6px 10px;';
    const numberInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 90px;';
    const checkboxInputStyle =
        'margin-left: 5px;' +
        'width: 25px;' +
        'height: 25px;';

    const minDiscountDiv =
        createMinDiscountFilterControl(minDiscountFilter, controlStyle, numberInputStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

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

            const conditionToHide = isLessThanFilter(discountValue, minDiscountFilter);
            showHideElement(productCard, conditionToHide);
        },
    );
}
