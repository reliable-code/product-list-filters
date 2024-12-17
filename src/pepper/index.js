import { waitForElement } from '../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { isLessThanFilter, isNotMatchTextFilter } from '../common/filter/compare';
import {
    createCheckboxFilterControl,
    createNumberFilterControl,
} from '../common/filter/factories/genericControls';
import {
    resetElementOpacity,
    setElementOpacity,
    updateElementOpacity,
} from '../common/dom/manipulation';
import {
    applyStyles,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createSearchFilterControl,
} from '../common/filter/factories/specificControls';
import { createFilterFactory } from '../common/filter/factories/createFilter';
import { SELECTORS } from './selectors';
import { STYLES } from './styles';
import { getNewestSeenProductId, setNewestSeenProductId } from './db';
import { ATTRIBUTES } from './attributes';

const { createGlobalFilter } = createFilterFactory(initProcessProductCards);

const nameFilter = createGlobalFilter('name-filter');
const minVotesFilter = createGlobalFilter('min-votes-filter', 50);
const showExpiredFilter = createGlobalFilter('show-expired-filter', false);
const filterEnabled = createGlobalFilter('filter-enabled', true);

await makeDiscussionsSticky();

initProcessProductCards();

function initProcessProductCards() {
    const productCards = getAllElements(SELECTORS.PRODUCT_CARD);

    if (productCards.length) {
        const productCardContainer = productCards[0].parentElement;
        appendFilterControlsIfNeeded(productCardContainer, appendFiltersContainer);

        processProductCards();
        new MutationObserver(processProductCards).observe(productCardContainer, {
            childList: true,
            subtree: true,
        });
    }
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);

    const nameFilterDiv = createSearchFilterControl(
        nameFilter, STYLES.CONTROL, STYLES.TEXT_INPUT,
    );
    const minVotesDiv = createNumberFilterControl(
        'Минимально голосов: ',
        minVotesFilter,
        '50',
        '0',
        '10000',
        STYLES.CONTROL,
        STYLES.NUMBER_INPUT,
    );

    const showExpiredDiv = createCheckboxFilterControl(
        'Завершённые: ',
        showExpiredFilter,
        STYLES.CONTROL,
        STYLES.CHECKBOX_INPUT,
    );

    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled,
        STYLES.CONTROL,
        STYLES.CHECKBOX_INPUT,
    );

    filtersContainer.append(
        nameFilterDiv, minVotesDiv, showExpiredDiv, filterEnabledDiv,
    );
    parentNode.prepend(filtersContainer);
}

function processProductCards() {
    const productCards = getAllElements(SELECTORS.PRODUCT_CARD);

    productCards.forEach(processProductCard);
}

function processProductCard(productCard) {
    if (!filterEnabled.value) {
        resetElementOpacity(productCard);
        return;
    }

    const isExpired = productCard.classList.contains('expired-view');

    if (isExpired && !showExpiredFilter.value) {
        setElementOpacity(productCard);
        return;
    }

    const productCardRating = getFirstElement(SELECTORS.PRODUCT_CARD_RATING, productCard);

    if (productCardRating.innerText.includes('Новое')) return;

    const productCardNameWrap = getFirstElement(SELECTORS.PRODUCT_NAME, productCard);
    const productCardRatingNumber = getElementInnerNumber(productCardRating, true);

    const productCardName = productCardNameWrap.innerText;

    const shouldSetOpacity =
        isNotMatchTextFilter(productCardName, nameFilter) ||
        isLessThanFilter(productCardRatingNumber, minVotesFilter);
    updateElementOpacity(productCard, shouldSetOpacity);
}

function getProductId(productCard) {
    const productCardLink = getFirstElement(SELECTORS.PRODUCT_CARD_LINK, productCard);
    const productCardLinkHref = productCardLink.getAttribute('href');
    const productIdString = productCardLinkHref.split('-')
        .pop();

    return +productIdString;
}

function highlightNewestSeenProductCard(productId, productCard) {
    if (productId === getNewestSeenProductId()) {
        productCard.style.border = '5px solid #8ab854';
    } else {
        productCard.style.removeProperty('border');
    }
}

function addMarkAsNewestSeenHandler(productCard, productId) {
    if (productCard.hasAttribute(ATTRIBUTES.MARK_AS_NEWEST_SEEN_APPENDED)) return;
    productCard.addEventListener('mousedown', (event) => {
        if (event.button === 1) {
            markAsNewestSeen(productId);
            event.preventDefault();
        }
    });
    productCard.setAttribute(ATTRIBUTES.MARK_AS_NEWEST_SEEN_APPENDED, '');
}

function markAsNewestSeen(productId) {
    setNewestSeenProductId(productId);
    processProductCards();
}

async function makeDiscussionsSticky() {
    const discussions = await waitForElement(document, SELECTORS.DISCUSSIONS);
    if (!discussions) return;

    discussions.style.position = 'sticky';
    discussions.style.top = '0';
}
