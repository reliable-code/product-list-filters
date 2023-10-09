import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    hideElement,
    showElement,
} from '../common/dom';
import { getStorageValueOrDefault, setStorageValueFromEvent } from '../common/storage';
import {
    appendFilterControlsIfNeeded,
    createFilterControlCheckbox,
    createMinVotesFilterControl,
} from '../common/filter';

const MIN_VOTES = 100;
const SHOW_EXPIRED = false;

const MIN_VOTES_LOCAL_STORAGE_KEY = 'min-votes-filter';
const SHOW_EXPIRED_LOCAL_STORAGE_KEY = 'show-expired-filter';
const PRODUCT_CARD_LIST_SELECTOR = '.listLayout-main';
const PRODUCT_CARD_SELECTOR = '.thread:not(.js-telegram-widget)';
const PRODUCT_CARD_RATING_SELECTOR = '.vote-box > span';

let minVotesValue = getStorageValueOrDefault(MIN_VOTES_LOCAL_STORAGE_KEY, MIN_VOTES);
let showExpiredChecked = getStorageValueOrDefault(SHOW_EXPIRED_LOCAL_STORAGE_KEY, SHOW_EXPIRED);

setInterval(initListClean, 500);

function initListClean() {
    const productCardList = getFirstElement(PRODUCT_CARD_LIST_SELECTOR);

    if (productCardList) {
        appendFilterControlsIfNeeded(productCardList, appendFiltersContainer);

        cleanList();
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

    filtersContainer.append(minVotesDiv, showExpiredDiv);

    parentNode.prepend(filtersContainer);
}

function updateMinVotesValue(e) {
    minVotesValue = setStorageValueFromEvent(e, MIN_VOTES_LOCAL_STORAGE_KEY);
}

function updateShowExpiredValue(e) {
    showExpiredChecked = setStorageValueFromEvent(e, SHOW_EXPIRED_LOCAL_STORAGE_KEY);
}

function cleanList() {
    const productCards = getAllElements(PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
            const isExpired = productCard.classList.contains('thread--expired');

            if (isExpired && !showExpiredChecked) {
                hideElement(productCard);

                return;
            }

            const productCardRating = getFirstElement(PRODUCT_CARD_RATING_SELECTOR, productCard);

            const productCardRatingNumber = getElementInnerNumber(productCardRating, true);

            if (productCardRatingNumber < minVotesValue) {
                hideElement(productCard);
            } else {
                showElement(productCard);
            }
        },
    );
}
