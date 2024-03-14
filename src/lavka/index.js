import {
    debounce,
    getAllElements,
    getFirstElement,
    hideElement,
    insertAfter,
    showElement,
    showHideElement,
} from '../common/dom';
import { StoredInputValue } from '../common/localstorage';
import { removeNonDigit } from '../common/string';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMinDiscountFilterControl,
    isLessThanFilter,
} from '../common/filter';

const minDiscountFilter = new StoredInputValue('min-discount-filter', null, cleanList);
const filterEnabled = new StoredInputValue('filter-enabled', true, cleanList);

const MAIN_CONTENT_SELECTOR = '#main-content-id';
const PRODUCT_CARD_LINK_SELECTOR = '[data-type="product-card-link"]';

let mainContent;

initMainContent();
observeHead();

function observeHead() {
    const observer = new MutationObserver(debounce(initMainContent));
    observer.observe(document.head, {
        childList: true,
    });
}

function initMainContent() {
    mainContent = getFirstElement(MAIN_CONTENT_SELECTOR);
    const observer = new MutationObserver(debounce(initListClean, 50));
    observer.observe(mainContent, {
        childList: true,
        subtree: true,
    });
}

function initListClean() {
    const productCardLinks = getAllElements(PRODUCT_CARD_LINK_SELECTOR, mainContent);

    if (productCardLinks.length) {
        appendFilterControlsIfNeeded(mainContent, appendFiltersContainer);

        cleanList();
    }
}

function appendFiltersContainer(filtersContainer, parentNode) {
    filtersContainer.style =
        'display: flex;' +
        'margin-top: 14px;' +
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

function cleanList() {
    console.log('cleanList');

    const productCardLinks = getAllElements(PRODUCT_CARD_LINK_SELECTOR, mainContent);

    console.log(productCardLinks.length);
    if (!minDiscountFilter.value) {
        return;
    }

    productCardLinks.forEach(
        (productCardLink) => {
            const productCardLinksParent = productCardLink.parentNode;
            const productCard = productCardLinksParent.parentNode.parentNode;
            productCard.style.flex = 'none';
            productCard.style.width = '25%';

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
