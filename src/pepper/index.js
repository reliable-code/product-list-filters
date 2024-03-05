import {
    defineElementOpacity,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    InputValue,
    resetElementOpacity,
    setElementOpacity,
    waitForElement,
} from '../common/dom';
import { StoredInputValue } from '../common/storage';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createFilterControlCheckbox,
    createMinVotesFilterControl,
    isLessThanFilter,
} from '../common/filter';

const minVotesFilter = new InputValue(50);
const showExpiredFilter = new StoredInputValue('show-expired-filter', false);
const filterEnabled = new StoredInputValue('filter-enabled', true);

const PRODUCT_CARD_LIST_SELECTOR = '.listLayout-main';
const PRODUCT_CARD_SELECTOR = '.thread--type-list:not(.js-telegram-widget)';
const PRODUCT_CARD_RATING_SELECTOR = '.vote-box > span';

const DISCUSSIONS_SELECTOR = ':scope > div:not(.js-vue2):not(.vue-portal-target)';

setInterval(initListClean, 100);
makeDiscussionsSticky();

const productCardList = getFirstElement(PRODUCT_CARD_LIST_SELECTOR);

function initListClean() {
    const productCards = getAllElements(PRODUCT_CARD_SELECTOR);

    if (productCardList && productCards.length) {
        appendFilterControlsIfNeeded(productCardList, appendFiltersContainer);

        cleanList(productCards);
    }
}

function appendFiltersContainer(filtersContainer, parentNode) {
    const observerCallback = ([e]) => {
        e.target.style.boxShadow = e.intersectionRatio < 1 ? '0px 0px 10px' : 'none';
    };

    const observer = new IntersectionObserver(
        observerCallback,
        { threshold: [1] },
    );

    observer.observe(filtersContainer);

    filtersContainer.style =
        'display: flex;' +
        'grid-gap: 15px;' +
        'margin-top: 0.5em;' +
        'padding: 11px 19px;' +
        'background-color: #fff;' +
        'border-radius: 8px;' +
        'position: sticky;' +
        'z-index: 50;' +
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
                resetElementOpacity(productCard);

                return;
            }

            const isExpired = productCard.classList.contains('thread--expired');

            if (isExpired && !showExpiredFilter.value) {
                setElementOpacity(productCard);

                return;
            }

            const productCardRating = getFirstElement(PRODUCT_CARD_RATING_SELECTOR, productCard);

            if (productCardRating.innerText.includes('Новое')) return;

            const productCardRatingNumber = getElementInnerNumber(productCardRating, true);

            const conditionToDefine =
                isLessThanFilter(productCardRatingNumber, minVotesFilter);
            defineElementOpacity(productCard, conditionToDefine);
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
