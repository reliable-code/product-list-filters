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
    createMinRatingFilterControl,
    createNoRatingFilterControl,
} from '../common/filter';

const MIN_RATING = 4.0;
const NO_RATING = false;

const MIN_RATING_STORAGE_KEY = 'min-rating-filter';
const NO_RATING_STORAGE_KEY = 'no-rating-filter';
const PRODUCT_CARD_LIST_SELECTOR = '.catalog-list';
const PRODUCT_CARD_SELECTOR = '.catalog-grid_new__item';
const PRODUCT_CARD_RATING_SELECTOR = '.rating-number';

let minRatingValue = getStorageValueOrDefault(MIN_RATING_STORAGE_KEY, MIN_RATING);
let noRatingChecked = getStorageValueOrDefault(NO_RATING_STORAGE_KEY, NO_RATING);

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
        'margin-left: 10px;';

    const controlStyle =
        'display: flex;' +
        'align-items: center;';
    const numberInputStyle =
        'border: 1px solid #C9C9C9;' +
        'border-radius: 8px;' +
        'height: 40px;' +
        'padding: 0 16px;';
    const checkboxInputStyle =
        'border: 1px solid #C9C9C9;' +
        'border-radius: 4px;' +
        'width: 22px;' +
        'height: 22px;';

    const minRatingDiv =
        createMinRatingFilterControl(
            minRatingValue,
            updateMinRatingValue,
            controlStyle,
            numberInputStyle,
        );

    const noRatingDiv =
        createNoRatingFilterControl(
            noRatingChecked,
            updateNoRatingValue,
            controlStyle,
            checkboxInputStyle,
        );

    filtersContainer.append(minRatingDiv, noRatingDiv);

    parentNode.prepend(filtersContainer);
}

function updateMinRatingValue(e) {
    minRatingValue = setStorageValueFromEvent(e, MIN_RATING_STORAGE_KEY);
}

function updateNoRatingValue(e) {
    noRatingChecked = setStorageValueFromEvent(e, NO_RATING_STORAGE_KEY);
}

function cleanList() {
    const productCards = getAllElements(PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
            const productCardRating = getFirstElement(PRODUCT_CARD_RATING_SELECTOR, productCard);

            if (!productCardRating) {
                if (!noRatingChecked) {
                    hideElement(productCard);
                } else {
                    showElement(productCard);
                }

                return;
            }

            const productCardRatingNumber = getElementInnerNumber(productCardRating);

            showHideElement(productCard, productCardRatingNumber < minRatingValue);
        },
    );
}
