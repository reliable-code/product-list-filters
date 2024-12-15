import { waitForElement } from '../common/dom/utils';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { isLessThanFilter } from '../common/filter/compare';
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
import { createEnabledFilterControl } from '../common/filter/factories/specificControls';
import { createFilterFactory } from '../common/filter/factories/createFilter';
import { SELECTORS } from './selectors';

const { createGlobalFilter } = createFilterFactory(initListClean);

const minVotesFilter = createGlobalFilter('min-votes-filter', 50);
const showExpiredFilter = createGlobalFilter('show-expired-filter', false);
const filterEnabled = createGlobalFilter('filter-enabled', true);

setInterval(initListClean, 100);
await makeDiscussionsSticky();

const productCardList = getFirstElement(SELECTORS.PRODUCT_CARD_CONTAINER);

function initListClean() {
    const productCards = getAllElements(SELECTORS.PRODUCT_CARD);

    if (productCardList && productCards.length) {
        appendFilterControlsIfNeeded(productCardList, appendFiltersContainer);

        processProductCards(productCards);
    }
}

function appendFiltersContainer(filtersContainer, parentNode) {
    const filtersContainerStyle = {
        display: 'flex',
        gridGap: '15px',
        padding: '11px 19px',
        marginBottom: '.5rem',
        backgroundColor: '#fff',
        borderWidth: '1px',
        borderColor: 'rgb(229, 229, 229)',
        borderRadius: '10px',
        position: 'sticky',
        zIndex: '11',
        top: '-1px',
    };

    applyStyles(filtersContainer, filtersContainerStyle);

    const controlStyle = {
        display: 'flex',
        alignItems: 'center',
    };

    const inputStyle = {
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        marginLeft: '7px',
    };

    const numberInputStyle = {
        ...inputStyle,
        padding: '7px 14px',
        backgroundColor: '#fff',
    };

    const checkboxInputStyle = {
        ...inputStyle,
        width: '24px',
        height: '24px',
    };

    const minVotesDiv = createNumberFilterControl(
        'Минимально голосов: ',
        minVotesFilter,
        '50',
        '0',
        '10000',
        controlStyle,
        numberInputStyle,
    );

    const showExpiredDiv = createCheckboxFilterControl(
        'Завершённые: ', showExpiredFilter, controlStyle, checkboxInputStyle,
    );

    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, controlStyle, checkboxInputStyle,
    );

    filtersContainer.append(minVotesDiv, showExpiredDiv, filterEnabledDiv);

    parentNode.prepend(filtersContainer);
}

function processProductCards(productCards) {
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

    const productCardRatingNumber = getElementInnerNumber(productCardRating, true);

    const shouldSetOpacity =
        isLessThanFilter(productCardRatingNumber, minVotesFilter);
    updateElementOpacity(productCard, shouldSetOpacity);
}

async function makeDiscussionsSticky() {
    const discussions = await waitForElement(document, SELECTORS.DISCUSSIONS);
    if (!discussions) return;

    discussions.style.position = 'sticky';
    discussions.style.top = '0';
}
