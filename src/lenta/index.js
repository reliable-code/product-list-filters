import {
    appendFilterControlsIfNeeded,
    createFilterControlCheckbox,
    createMinRatingFilterControl,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    hideElement,
    showElement,
    updateValue,
} from '../common/dom';
import { getLocalStorageValueOrDefault } from '../common/storage';

const MIN_RATING = 4.0;
const NO_RATING = false;

const MIN_RATING_LOCAL_STORAGE_KEY = 'min-rating-filter';
const NO_RATING_LOCAL_STORAGE_KEY = 'no-rating-filter';
const PRODUCT_CARD_LIST_SELECTOR = '.catalog-list';
const PRODUCT_CARD_SELECTOR = '.catalog-grid_new__item';
const PRODUCT_CARD_RATING_SELECTOR = '.rating-number';

let minRatingValue = getLocalStorageValueOrDefault(MIN_RATING_LOCAL_STORAGE_KEY, MIN_RATING);
let noRatingChecked = getLocalStorageValueOrDefault(NO_RATING_LOCAL_STORAGE_KEY, NO_RATING);

setInterval(initListClean, 500);

function initListClean() {
    const productCardList = getFirstElement(document, PRODUCT_CARD_LIST_SELECTOR);

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
            updateMinRatingInput,
            controlStyle,
            numberInputStyle,
        );

    const noRatingDiv =
        createFilterControlCheckbox(
            'Без рейтинга: ',
            noRatingChecked,
            updateNoRatingInput,
            controlStyle,
            checkboxInputStyle,
        );

    filtersContainer.append(minRatingDiv);
    filtersContainer.append(noRatingDiv);

    parentNode.prepend(filtersContainer);
}

function updateMinRatingInput(e) {
    minRatingValue = updateValue(e, MIN_RATING_LOCAL_STORAGE_KEY);
}

function updateNoRatingInput(e) {
    noRatingChecked = updateValue(e, NO_RATING_LOCAL_STORAGE_KEY);
}

function cleanList() {
    const productCards = getAllElements(document, PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
            const productCardRating = getFirstElement(productCard, PRODUCT_CARD_RATING_SELECTOR);

            if (!productCardRating) {
                if (!noRatingChecked) {
                    hideElement(productCard);
                } else {
                    showElement(productCard);
                }

                return;
            }

            const productCardRatingNumber = getElementInnerNumber(productCardRating);

            if (productCardRatingNumber < minRatingValue) {
                hideElement(productCard);
            } else {
                showElement(productCard);
            }
        },
    );
}
