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
    filtersContainer.style = '';

    const controlStyle = '';
    const numberInputStyle = '';
    const checkboxInputStyle = '';

    const minVotesDiv =
        createMinVotesFilterControl(
            minVotesValue, updateMinVotesValue, controlStyle, numberInputStyle,
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
