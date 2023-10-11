import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    hideElement,
    showElement,
    showHideElement,
} from '../common/dom';
import { getStorageValueOrDefault, setStorageValueFromEvent } from '../common/storage';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createFilterControlCheckbox,
    createMinVotesFilterControl,
} from '../common/filter';

const MIN_VOTES = 100;
const SHOW_EXPIRED = false;
const FILTER_ENABLED = true;

const MIN_VOTES_STORAGE_KEY = 'min-votes-filter';
const SHOW_EXPIRED_STORAGE_KEY = 'show-expired-filter';
const FILTER_ENABLED_STORAGE_KEY = 'filter-enabled';
const PRODUCT_CARD_LIST_SELECTOR = '.listLayout-main';
const PRODUCT_CARD_SELECTOR = '.thread--type-list:not(.js-telegram-widget)';
const PRODUCT_CARD_RATING_SELECTOR = '.vote-box > span';

let minVotesValue = getStorageValueOrDefault(MIN_VOTES_STORAGE_KEY, MIN_VOTES);
let showExpiredChecked = getStorageValueOrDefault(SHOW_EXPIRED_STORAGE_KEY, SHOW_EXPIRED);
let filterEnabledChecked = getStorageValueOrDefault(FILTER_ENABLED_STORAGE_KEY, FILTER_ENABLED);

setInterval(initListClean, 100);

const productCardList = getFirstElement(PRODUCT_CARD_LIST_SELECTOR);

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
        'margin-top: 0.5em;' +
        'padding: 11px 19px;' +
        'background-color: #fff;' +
        'border-radius: 8px;';

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
        createMinVotesFilterControl(
            minVotesValue,
            updateMinVotesValue,
            controlStyle,
            numberInputStyle,
        );

    const showExpiredDiv =
        createFilterControlCheckbox(
            'Завершённые: ',
            showExpiredChecked,
            updateShowExpiredValue,
            controlStyle,
            checkboxInputStyle,
        );

    const filterEnabledDiv =
        createEnabledFilterControl(
            filterEnabledChecked,
            updateFilterEnabledValue,
            controlStyle,
            checkboxInputStyle,
        );

    filtersContainer.append(minVotesDiv, showExpiredDiv, filterEnabledDiv);

    parentNode.prepend(filtersContainer);
}

function updateMinVotesValue(e) {
    minVotesValue = setStorageValueFromEvent(e, MIN_VOTES_STORAGE_KEY);
}

function updateShowExpiredValue(e) {
    showExpiredChecked = setStorageValueFromEvent(e, SHOW_EXPIRED_STORAGE_KEY);
}

function updateFilterEnabledValue(e) {
    filterEnabledChecked = setStorageValueFromEvent(e, FILTER_ENABLED_STORAGE_KEY);
}

function cleanList(productCards) {
    productCards.forEach(
        (productCard) => {
            if (!filterEnabledChecked) {
                showElement(productCard);

                return;
            }

            const isExpired = productCard.classList.contains('thread--expired');

            if (isExpired && !showExpiredChecked) {
                hideElement(productCard);

                return;
            }

            const productCardRating = getFirstElement(PRODUCT_CARD_RATING_SELECTOR, productCard);

            const productCardRatingNumber = getElementInnerNumber(productCardRating, true);

            showHideElement(productCard, productCardRatingNumber < minVotesValue);
        },
    );
}
