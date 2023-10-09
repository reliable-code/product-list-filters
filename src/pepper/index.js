import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    hideElement,
    showElement,
} from '../common/dom';
import { getStorageValueOrDefault, setStorageValueFromEvent } from '../common/storage';
import { appendFilterControlsIfNeeded, createMinVotesFilterControl } from '../common/filter';

const MIN_VOTES = 100;

const MIN_VOTES_LOCAL_STORAGE_KEY = 'min-votes-filter';
const PRODUCT_CARD_LIST_SELECTOR = '.listLayout-main';
const PRODUCT_CARD_SELECTOR = '.thread:not(.thread--expired):not(.js-telegram-widget)';
const PRODUCT_CARD_RATING_SELECTOR = '.vote-temp';

let minVotesValue = getStorageValueOrDefault(MIN_VOTES_LOCAL_STORAGE_KEY, MIN_VOTES);

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

    const minVotesDiv =
        createMinVotesFilterControl(
            minVotesValue, updateMinVotesValue, controlStyle, numberInputStyle,
        );

    filtersContainer.append(minVotesDiv);

    parentNode.prepend(filtersContainer);
}

function updateMinVotesValue(e) {
    minVotesValue = setStorageValueFromEvent(e, MIN_VOTES_LOCAL_STORAGE_KEY);
}

function cleanList() {
    const productCards = getAllElements(PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
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
