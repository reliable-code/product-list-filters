import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    hideElement,
    showElement,
    showHideElement,
} from '../common/dom';
import { StorageValue } from '../common/storage';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createFilterControlCheckbox,
    createMinVotesFilterControl,
} from '../common/filter';

const minVotesFilter = new StorageValue('min-votes-filter', 100);
const showExpiredFilter = new StorageValue('show-expired-filter', false);
const filterEnabled = new StorageValue('filter-enabled', true);

const PRODUCT_CARD_LIST_SELECTOR = '.listLayout-main';
const PRODUCT_CARD_SELECTOR = '.thread--type-list:not(.js-telegram-widget)';
const PRODUCT_CARD_RATING_SELECTOR = '.vote-box > span';

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
            minVotesFilter, controlStyle, numberInputStyle,
        );

    const showExpiredDiv =
        createFilterControlCheckbox(
            'Завершённые: ', showExpiredFilter, controlStyle, checkboxInputStyle,
        );

    const filterEnabledDiv =
        createEnabledFilterControl(
            filterEnabled, controlStyle, checkboxInputStyle,
        );

    filtersContainer.append(minVotesDiv, showExpiredDiv, filterEnabledDiv);

    parentNode.prepend(filtersContainer);
}

function cleanList(productCards) {
    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                showElement(productCard);

                return;
            }

            const isExpired = productCard.classList.contains('thread--expired');

            if (isExpired && !showExpiredFilter.value) {
                hideElement(productCard);

                return;
            }

            const productCardRating = getFirstElement(PRODUCT_CARD_RATING_SELECTOR, productCard);

            const productCardRatingNumber = getElementInnerNumber(productCardRating, true);

            showHideElement(
                productCard, productCardRatingNumber < minVotesFilter.value,
            );
        },
    );
}
