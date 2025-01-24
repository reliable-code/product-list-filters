import { debounce } from '../common/dom/utils';
import { removeNonDigit } from '../common/string';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { pathnameIncludes, somePathElementEquals } from '../common/url';
import { createDiv } from '../common/dom/factories/elements';
import { isGreaterThanFilter, isLessThanFilter } from '../common/filter/compare';
import {
    createCheckboxFilterControl,
    createNumberFilterControl,
} from '../common/filter/factories/genericControls';
import {
    applyStyles,
    insertAfter,
    showElement,
    updateElementDisplay,
} from '../common/dom/manipulation';
import { getAllElements, getElementInnerNumber, getFirstElement } from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMaxPriceFilterControl,
    createMinDiscountFilterControl,
    createMinPriceFilterControl,
} from '../common/filter/factories/specificControls';
import { SELECTORS } from './selectors';
import { STYLES } from './styles';
import { createFilterFactory } from '../common/filter/factories/createFilter';
import { createSeparator } from '../common/filter/factories/helpers';

const { createGlobalFilter } = createFilterFactory(processProductCards);

const minDiscountFilter = createGlobalFilter('min-discount-filter');
const minPriceFilter = createGlobalFilter('min-price-filter');
const maxPriceFilter = createGlobalFilter('max-price-filter');
const filterEnabled = createGlobalFilter('filter-enabled', true);

const observerReloadInterval = createGlobalFilter(
    'observer-reload-interval', 3.5, runReloadTimerIfNeeded,
);
const minObserverSectionLength = createGlobalFilter(
    'min-observer-section-length', 10,
);
const showObserverNotification = createGlobalFilter(
    'show-observer-notification', true,
);
const observerEnabled = createGlobalFilter(
    'observer-enabled', true, runReloadTimerIfNeeded,
);

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
    applyStyles(filtersContainer, STYLES.CONTAINER);

    const minDiscountDiv = createMinDiscountFilterControl(
        minDiscountFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const minPriceDiv = createMinPriceFilterControl(
        minPriceFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const maxPriceDiv = createMaxPriceFilterControl(
        maxPriceFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const separatorDiv = createSeparator(
        STYLES.CONTROL,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );

    filtersContainer.append(
        minDiscountDiv, minPriceDiv, maxPriceDiv, separatorDiv, filterEnabledDiv,
    );
    insertAfter(parentNode.firstChild, filtersContainer);
}

function appendObserverControlsContainer(observerControlsContainer, parentNode) {
    applyStyles(observerControlsContainer, STYLES.CONTAINER);

    const reloadTimerControlStyle = STYLES.RELOAD_TIMER_CONTROL;

    const observerReloadIntervalDiv = createNumberFilterControl(
        'Обновление, мин.: ',
        observerReloadInterval,
        0.5,
        1,
        60,
        STYLES.CONTROL,
        STYLES.NUMBER_INPUT,
    );
    const minObserverSectionLengthDiv = createNumberFilterControl(
        'Мин. в секции: ',
        minObserverSectionLength,
        1,
        1,
        50,
        STYLES.CONTROL,
        STYLES.NUMBER_INPUT,
    );
    const showObserverNotificationDiv = createCheckboxFilterControl(
        'Оповещение: ',
        showObserverNotification,
        STYLES.CONTROL,
        STYLES.CHECKBOX_INPUT,
    );
    const separatorDiv = createSeparator(
        STYLES.CONTROL,
    );
    const observerEnabledDiv = createEnabledFilterControl(
        observerEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );
    reloadTimerDiv = createDiv(reloadTimerControlStyle, reloadTimerSecondsLeft);

    observerControlsContainer.append(
        observerReloadIntervalDiv,
        minObserverSectionLengthDiv,
        showObserverNotificationDiv,
        separatorDiv,
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
    const productCard = productCardLinksParent.parentNode.parentNode;
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
        isLessThanFilter(price, minPriceFilter) ||
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
