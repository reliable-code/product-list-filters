import { waitForElement } from '../common/dom/utils';
import { StoredInputValue } from '../common/storage/localstorage';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { InputValue } from '../common/storage/models/inputValue';
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

const minVotesFilter = new InputValue(50);
const showExpiredFilter = new StoredInputValue('show-expired-filter', false);
const filterEnabled = new StoredInputValue('filter-enabled', true);

const PRODUCT_CARD_CONTAINER_SELECTOR = '#deals-container';
const PRODUCT_CARD_SELECTOR = '.deal-card';
const PRODUCT_CARD_RATING_SELECTOR = '.common-box span';

const DISCUSSIONS_SELECTOR = ':scope > div:not(.js-vue2):not(.vue-portal-target)';

setInterval(initListClean, 100);
// makeDiscussionsSticky();

const productCardList = getFirstElement(PRODUCT_CARD_CONTAINER_SELECTOR);

function initListClean() {
    const productCards = getAllElements(PRODUCT_CARD_SELECTOR);

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
    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                resetElementOpacity(productCard);

                return;
            }

            const isExpired = productCard.classList.contains('expired-view');

            if (isExpired && !showExpiredFilter.value) {
                setElementOpacity(productCard);

                return;
            }

            const productCardRating = getFirstElement(PRODUCT_CARD_RATING_SELECTOR, productCard);

            if (productCardRating.innerText.includes('Новое')) return;

            const productCardRatingNumber = getElementInnerNumber(productCardRating, true);

            const shouldSetOpacity =
                isLessThanFilter(productCardRatingNumber, minVotesFilter);
            updateElementOpacity(productCard, shouldSetOpacity);
        },
    );
}

function makeDiscussionsSticky() {
    const listLayoutSide = getFirstElement('.listLayout-side');
    waitForElement(listLayoutSide, DISCUSSIONS_SELECTOR, 2000)
        .then(
            (discussions) => {
                if (!discussions) return;

                discussions.style.position = 'sticky';
                discussions.style.top = '0';
            },
        );
}
