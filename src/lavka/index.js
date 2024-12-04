import { debounce } from '../common/dom/utils';
import { StoredInputValue } from '../common/storage/localstorage';
import { removeNonDigit } from '../common/string';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { pathnameIncludes, somePathElementEquals } from '../common/url';
import { createDiv } from '../common/dom/factories/elements';
import { isGreaterThanFilter, isLessThanFilter } from '../common/filter/compare';
import {
    createCheckboxFilterControl,
    createNumberFilterControl,
} from '../common/filter/factories/genericControls';
import { insertAfter, showElement, updateElementDisplay } from '../common/dom/manipulation';
import {
    applyStyles,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMaxPriceFilterControl,
    createMinDiscountFilterControl,
} from '../common/filter/factories/specificControls';

const SELECTORS = {
    MAIN_CONTENT: '#main-content-id',
    SECTION_HEADER: 'h2',
    OBSERVED_SECTION_SELECTOR: '[data-id="promo-expiring-products"]',
    PRODUCT_CARD_LINK: '[data-type="product-card-link"]',
    PRODUCT_CARD_PRICE_WRAP: 'span [aria-hidden="true"]',
    PROMO_LABEL: 'li',
};

function createFilter(filterName, defaultValue = null, onChange = processProductCards) {
    return StoredInputValue.create(filterName, defaultValue, onChange);
}

const minDiscountFilter = createFilter('min-discount-filter');
const maxPriceFilter = createFilter('max-price-filter');
const filterEnabled = createFilter('filter-enabled', true);

const observerReloadInterval =
    createFilter('observer-reload-interval', 3.5, runReloadTimerIfNeeded);
const minObserverSectionLength =
    createFilter('min-observer-section-length', 10);
const showObserverNotification =
    createFilter('show-observer-notification', true);
const observerEnabled =
    createFilter('observer-enabled', true, runReloadTimerIfNeeded);

const CONTAINER_STYLE = {
    display: 'flex',
    marginTop: '14px',
    gridGap: '15px',
};
const CONTROL_STYLE = {
    display: 'flex',
    alignItems: 'center',
};
const INPUT_STYLE = {
    marginLeft: '5px',
    border: '2px solid #b3bcc5',
    borderRadius: '6px',
    padding: '6px 10px',
};
const NUMBER_INPUT_STYLE = {
    ...INPUT_STYLE,
    width: '90px',
};
const CHECKBOX_INPUT_STYLE = {
    marginLeft: '5px',
    width: '25px',
    height: '25px',
};

let mainContent;
let firstRun = true;
let checkReloadTimerIntervalId;
let reloadTimerSecondsLeft = null;
let reloadTimerDiv;

(function observeHead() {
    const observer = new MutationObserver(debounce(initMainContent, 750));
    observer.observe(document.head, {
        childList: true,
    });
}());

function initMainContent() {
    mainContent = getFirstElement(SELECTORS.MAIN_CONTENT);
    if (!mainContent) {
        return;
    }

    if (!pathnameIncludes('category')) {
        return;
    }

    initProcessProductCards();

    const observer = new MutationObserver(debounce(initProcessProductCards, 100));
    observer.observe(mainContent, {
        childList: true,
        subtree: true,
    });
}

function showSectionNotification(sectionName, sectionLength) {
    const sectionLengthInfo = sectionLength ? `\n(${sectionLength} товаров)` : '';

    window.GM_notification({
        text: `Появился раздел "${sectionName}"${sectionLengthInfo}`,
        tag: 'section-appear',
        highlight: true,
        silent: true,
    });
}

function checkSectionExistsByName(sectionName) {
    const headers = getAllElements(SELECTORS.SECTION_HEADER, mainContent);
    const isSectionExists =
        [...headers].some((header) => header.innerText.includes(sectionName));

    if (!isSectionExists) return;

    showSectionNotification(sectionName);
}

function checkSectionExistsBySelector(sectionSelector, sectionName) {
    const section = getFirstElement(sectionSelector);

    if (!section) return;

    const sectionLength = getAllElements(SELECTORS.PRODUCT_CARD_LINK, section).length;

    const header = getFirstElement(SELECTORS.SECTION_HEADER, section);
    header.innerText += ` (${sectionLength})`;

    if (observerEnabled.value
        && showObserverNotification.value
        && sectionLength >= minObserverSectionLength.value) {
        showSectionNotification(sectionName, sectionLength);
    }
}

function runReloadTimerIfNeeded() {
    if (reloadTimerSecondsLeft) reloadTimerSecondsLeft = null;
    if (checkReloadTimerIntervalId) clearInterval(checkReloadTimerIntervalId);
    reloadTimerDiv.textContent = null;

    if (!observerEnabled.value || !observerReloadInterval.value) return;

    reloadTimerSecondsLeft = observerReloadInterval.value * 60;
    checkReloadTimer();
    checkReloadTimerIntervalId = setInterval(checkReloadTimer, 1000);
}

function checkReloadTimer() {
    reloadTimerDiv.textContent = `До обновления: ${reloadTimerSecondsLeft} c.`;

    if (reloadTimerSecondsLeft > 0) {
        reloadTimerSecondsLeft -= 1;
        return;
    }

    window.location.reload();
}

function initProcessProductCards() {
    const productCardLinks = getAllElements(SELECTORS.PRODUCT_CARD_LINK, mainContent);

    if (!productCardLinks.length) return;

    if (somePathElementEquals('promo_and_cashback')) {
        appendFilterControlsIfNeeded(
            mainContent,
            appendObserverControlsContainer,
            false,
            'observerControlsContainer',
        );
    }

    appendFilterControlsIfNeeded(mainContent, appendFiltersContainer);

    if (firstRun) {
        firstRun = false;
        runReloadTimerIfNeeded();

        checkSectionExistsBySelector(
            SELECTORS.OBSERVED_SECTION_SELECTOR, 'Последний день',
        );
    }

    processProductCards();
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, CONTAINER_STYLE);

    const minDiscountDiv = createMinDiscountFilterControl(
        minDiscountFilter, CONTROL_STYLE, NUMBER_INPUT_STYLE,
    );
    const maxPriceDiv = createMaxPriceFilterControl(
        maxPriceFilter, CONTROL_STYLE, NUMBER_INPUT_STYLE, '25',
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, CONTROL_STYLE, CHECKBOX_INPUT_STYLE,
    );

    filtersContainer.append(minDiscountDiv, maxPriceDiv, filterEnabledDiv);
    insertAfter(parentNode.firstChild, filtersContainer);
}

function appendObserverControlsContainer(observerControlsContainer, parentNode) {
    applyStyles(observerControlsContainer, CONTAINER_STYLE);

    const reloadTimerControlStyle = {
        ...CONTROL_STYLE,
        marginLeft: 'auto',
        width: '170px',
    };

    const observerReloadIntervalDiv = createNumberFilterControl(
        'Обновление, мин.: ',
        observerReloadInterval,
        0.5,
        1,
        60,
        CONTROL_STYLE,
        NUMBER_INPUT_STYLE,
    );
    const minObserverSectionLengthDiv = createNumberFilterControl(
        'Мин. в секции: ',
        minObserverSectionLength,
        1,
        1,
        50,
        CONTROL_STYLE,
        NUMBER_INPUT_STYLE,
    );
    const showObserverNotificationDiv = createCheckboxFilterControl(
        'Оповещение: ',
        showObserverNotification,
        CONTROL_STYLE,
        CHECKBOX_INPUT_STYLE,
    );
    const observerEnabledDiv = createEnabledFilterControl(
        observerEnabled, CONTROL_STYLE, CHECKBOX_INPUT_STYLE,
    );
    reloadTimerDiv = createDiv(reloadTimerControlStyle, reloadTimerSecondsLeft);

    observerControlsContainer.append(
        observerReloadIntervalDiv,
        minObserverSectionLengthDiv,
        showObserverNotificationDiv,
        observerEnabledDiv,
        reloadTimerDiv,
    );

    insertAfter(parentNode.firstChild, observerControlsContainer);
}

function processProductCards() {
    const productCardLinks = getAllElements(SELECTORS.PRODUCT_CARD_LINK, mainContent);

    productCardLinks.forEach(processProductCard);
}

function processProductCard(productCardLink) {
    const productCardLinksParent = productCardLink.parentNode;
    const productCard = productCardLinksParent.parentNode.parentNode.parentNode;
    productCard.style.flex = 'none';
    productCard.style.width = '25%';

    if (!filterEnabled.value) {
        showElement(productCard);
        return;
    }

    const discountValue = getDiscountValue(productCardLinksParent);

    const priceWrap = getFirstElement(SELECTORS.PRODUCT_CARD_PRICE_WRAP, productCard);
    const price = getElementInnerNumber(priceWrap, true);

    const shouldHide =
        isLessThanFilter(discountValue, minDiscountFilter) ||
        isGreaterThanFilter(price, maxPriceFilter);
    updateElementDisplay(productCard, shouldHide);
}

function getDiscountValue(productCardLinksParent) {
    const promoLabel = getFirstElement(SELECTORS.PROMO_LABEL, productCardLinksParent);

    if (!promoLabel) {
        return 0;
    }

    const promoLabelText = promoLabel.innerText;

    if (!promoLabelText.includes('%')) {
        return 0;
    }

    return +removeNonDigit(promoLabelText);
}
