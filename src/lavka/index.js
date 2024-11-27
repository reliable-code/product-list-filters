import { debounce } from '../common/dom/utils';
import { StoredInputValue } from '../common/storage/localstorage';
import { removeNonDigit } from '../common/string';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { pathnameIncludes, somePathElementEquals } from '../common/url';
import { createDiv } from '../common/dom/factories/elements';
import { isGreaterThanFilter, isLessThanFilter } from '../common/filter/compare';
import {
    createFilterControlCheckbox,
    createFilterControlNumber,
} from '../common/filter/factories/genericControls';
import { insertAfter, showElement, updateElementDisplay } from '../common/dom/manipulation';
import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    styleStringToObject,
} from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMaxPriceFilterControl,
    createMinDiscountFilterControl,
} from '../common/filter/factories/specificControls';

const minDiscountFilter = new StoredInputValue('min-discount-filter', null, cleanList);
const maxPriceFilter = new StoredInputValue('max-price-filter', null, cleanList);
const filterEnabled = new StoredInputValue('filter-enabled', true, cleanList);

const observerReloadInterval =
    new StoredInputValue('observer-reload-interval', 3.5, runReloadTimerIfNeeded);
const minObserverSectionLength =
    new StoredInputValue('min-observer-section-length', 10);
const showObserverNotification =
    new StoredInputValue('show-observer-notification', true);
const observerEnabled =
    new StoredInputValue('observer-enabled', true, runReloadTimerIfNeeded);

const MAIN_CONTENT_SELECTOR = '#main-content-id';
const PRODUCT_CARD_LINK_SELECTOR = '[data-type="product-card-link"]';

const CONTAINER_STYLE =
    'display: flex;' +
    'margin-top: 14px;' +
    'grid-gap: 15px;';
const CONTROL_STYLE =
    'display: flex;' +
    'align-items: center;';
const INPUT_STYLE =
    'margin-left: 5px;' +
    'border: 2px solid #b3bcc5;' +
    'border-radius: 6px;' +
    'padding: 6px 10px;';
const NUMBER_INPUT_STYLE =
    INPUT_STYLE + // eslint-disable-line prefer-template
    'width: 90px;';
const CHECKBOX_INPUT_STYLE =
    'margin-left: 5px;' +
    'width: 25px;' +
    'height: 25px;';

let mainContent;
let firstRun = true;
let checkReloadTimerIntervalId;
let reloadTimerSecondsLeft = null;
let reloadTimerDiv;

initMainContent();
observeHead();

function observeHead() {
    const observer = new MutationObserver(debounce(initMainContent, 750));
    observer.observe(document.head, {
        childList: true,
    });
}

function initMainContent() {
    mainContent = getFirstElement(MAIN_CONTENT_SELECTOR);
    if (!mainContent || !pathnameIncludes('category')) return;

    const observer = new MutationObserver(debounce(initListClean, 100));
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
    const headers = getAllElements('h2', mainContent);
    const isSectionExists =
        [...headers].some((header) => header.innerText.includes(sectionName));

    if (!isSectionExists) return;

    showSectionNotification(sectionName);
}

function checkSectionExistsBySelector(sectionSelector, sectionName) {
    const section = getFirstElement(sectionSelector);

    if (!section) return;

    const sectionLength = getAllElements(PRODUCT_CARD_LINK_SELECTOR, section).length;

    const header = getFirstElement('h2', section);
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

function initListClean() {
    const productCardLinks = getAllElements(PRODUCT_CARD_LINK_SELECTOR, mainContent);

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
            '[data-id="promo-expiring-products"]', 'Последний день',
        );
    }

    cleanList();
}

function appendFiltersContainer(filtersContainer, parentNode) {
    filtersContainer.style = CONTAINER_STYLE;

    const minDiscountDiv =
        createMinDiscountFilterControl(minDiscountFilter, CONTROL_STYLE, NUMBER_INPUT_STYLE);

    const maxPriceDiv =
        createMaxPriceFilterControl(maxPriceFilter, CONTROL_STYLE, NUMBER_INPUT_STYLE, '25');

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, CONTROL_STYLE, CHECKBOX_INPUT_STYLE);

    filtersContainer.append(minDiscountDiv, maxPriceDiv, filterEnabledDiv);
    insertAfter(parentNode.firstChild, filtersContainer);
}

function appendObserverControlsContainer(observerControlsContainer, parentNode) {
    observerControlsContainer.style = CONTAINER_STYLE;
    const reloadTimerControlStyle =
        CONTROL_STYLE + // eslint-disable-line prefer-template
        'margin-left: auto;' +
        'width: 170px;';

    const reloadTimerControlStyleObj = styleStringToObject(reloadTimerControlStyle);

    const observerReloadIntervalDiv =
        createFilterControlNumber('Обновление, мин.: ',
            observerReloadInterval,
            0.5,
            1,
            60,
            CONTROL_STYLE,
            NUMBER_INPUT_STYLE);

    const minObserverSectionLengthDiv =
        createFilterControlNumber('Мин. в секции: ',
            minObserverSectionLength,
            1,
            1,
            50,
            CONTROL_STYLE,
            NUMBER_INPUT_STYLE);

    const showObserverNotificationDiv =
        createFilterControlCheckbox(
            'Оповещение: ', showObserverNotification, CONTROL_STYLE, CHECKBOX_INPUT_STYLE,
        );

    const observerEnabledDiv =
        createEnabledFilterControl(
            observerEnabled, CONTROL_STYLE, CHECKBOX_INPUT_STYLE,
        );

    reloadTimerDiv = createDiv(reloadTimerControlStyleObj, reloadTimerSecondsLeft);

    observerControlsContainer.append(
        observerReloadIntervalDiv,
        minObserverSectionLengthDiv,
        showObserverNotificationDiv,
        observerEnabledDiv,
        reloadTimerDiv,
    );

    insertAfter(parentNode.firstChild, observerControlsContainer);
}

function cleanList() {
    const productCardLinks = getAllElements(PRODUCT_CARD_LINK_SELECTOR, mainContent);

    productCardLinks.forEach(
        (productCardLink) => {
            const productCardLinksParent = productCardLink.parentNode;
            const productCard = productCardLinksParent.parentNode.parentNode.parentNode;
            productCard.style.flex = 'none';
            productCard.style.width = '25%';

            if (!filterEnabled.value) {
                showElement(productCard);
                return;
            }

            const discountValue = getDiscountValue(productCardLinksParent);

            const priceWrap = getFirstElement('span [aria-hidden="true"]', productCard);
            const price = getElementInnerNumber(priceWrap, true);

            const shouldHide =
                isLessThanFilter(discountValue, minDiscountFilter) ||
                isGreaterThanFilter(price, maxPriceFilter);
            updateElementDisplay(productCard, shouldHide);
        },
    );
}

function getDiscountValue(productCardLinksParent) {
    const promoLabel = getFirstElement('li', productCardLinksParent);

    if (!promoLabel) {
        return 0;
    }

    const promoLabelText = promoLabel.innerText;

    if (!promoLabelText.includes('%')) {
        return 0;
    }

    return +removeNonDigit(promoLabelText);
}
