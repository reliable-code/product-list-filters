import {
    createFilterControlCheckbox,
    createFilterControlNumber,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    updateInput,
} from '../common/dom';

const MIN_RATING = 4.0;
const NO_RATING = false;

const MIN_RATING_LOCAL_STORAGE_KEY = 'min-rating-filter';
const NO_RATING_LOCAL_STORAGE_KEY = 'no-rating-filter';
const PRODUCT_CARD_LIST_SELECTOR = '.catalog-list';
const FILTERS_CONTAINER_ID = 'filtersContainer';
const PRODUCT_CARD_SELECTOR = '.catalog-grid_new__item';
const PRODUCT_CARD_RATING_SELECTOR = '.rating-number';

const minRatingValue =
    +(localStorage.getItem(MIN_RATING_LOCAL_STORAGE_KEY) ?? MIN_RATING);
const noRatingChecked =
    JSON.parse((localStorage.getItem(NO_RATING_LOCAL_STORAGE_KEY) ?? NO_RATING));

setTimeout(() => {
    setInterval(initListClean, 500);
}, 1000);

function initListClean() {
    const productCardList = getFirstElement(document, PRODUCT_CARD_LIST_SELECTOR);

    if (productCardList) {
        appendFilterControlsIfNeeded(productCardList);

        cleanList();
    }
}

function appendFilterControlsIfNeeded(productCardList) {
    const filtersContainer = getFirstElement(productCardList, `#${FILTERS_CONTAINER_ID}`);

    if (filtersContainer) {
        return;
    }

    appendFilterControls(productCardList);
}

function appendFilterControls(productCardList) {
    const filtersContainer = document.createElement('div');
    filtersContainer.id = FILTERS_CONTAINER_ID;
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
        createFilterControlNumber(
            'Минимальный рейтинг: ',
            minRatingValue,
            '0.1',
            '4.0',
            '5.0',
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

    productCardList.prepend(filtersContainer);
}

function updateMinRatingInput(e) {
    updateInput(MIN_RATING_LOCAL_STORAGE_KEY, e);
}

function updateNoRatingInput(e) {
    updateInput(NO_RATING_LOCAL_STORAGE_KEY, e);
}

function cleanList() {
    const productCards = getAllElements(document, PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
            const productCardRating = getFirstElement(productCard, PRODUCT_CARD_RATING_SELECTOR);

            if (!productCardRating) {
                if (!noRatingChecked) productCard.remove();

                return;
            }

            const productCardRatingNumber = getElementInnerNumber(productCardRating);

            if (productCardRatingNumber < minRatingValue) {
                productCard.remove();
            }
        },
    );
}
