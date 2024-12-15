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
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    styleStringToObject,
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

        cleanList(productCards);
    }
}

function appendFiltersContainer(filtersContainer, parentNode) {
    filtersContainer.style =
        'display: flex;' +
        'grid-gap: 15px;' +
        'padding: 11px 19px;' +
        'margin-bottom: .5rem;' +
        'background-color: #fff;' +
        'border-width: 1px;' +
        'border-color: rgb(229 229 229);' +
        'border-radius: 10px;' +
        'position: sticky;' +
        'z-index: 11;' +
        'top: -1px;';

    const controlStyle =
        'display: flex;' +
        'align-items: center;';
    const inputStyle =
        'border: 1px solid #d1d5db;' +
        'border-radius: 8px;' +
        'margin-left: 7px;';
    const numberInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'padding: 7px 14px;' +
        'background-color: #fff;';
    const checkboxInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 24px;' +
        'height: 24px;';

    const minVotesDiv =
        createNumberFilterControl(
            'Минимально голосов: ',
            minVotesFilter,
            '50',
            '0',
            '10000',
            styleStringToObject(controlStyle),
            styleStringToObject(numberInputStyle),
        );

    const showExpiredDiv =
        createCheckboxFilterControl(
            'Завершённые: ', showExpiredFilter, styleStringToObject(controlStyle), styleStringToObject(checkboxInputStyle),
        );

    const filterEnabledDiv =
        createEnabledFilterControl(
            filterEnabled, styleStringToObject(controlStyle), styleStringToObject(checkboxInputStyle),
        );

    filtersContainer.append(minVotesDiv, showExpiredDiv, filterEnabledDiv);

    parentNode.prepend(filtersContainer);
}

function cleanList(productCards) {
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
