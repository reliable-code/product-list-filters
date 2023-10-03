import {
    createDefaultFilterControl,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    updateInput,
} from '../common/dom';

const MIN_RATING = 4.0;

const MIN_RATING_LOCAL_STORAGE_KEY = 'min-rating-filter';
const PRODUCT_CARD_LIST_SELECTOR = '.catalog-list';
const MIN_RATING_DIV_ID = 'minRatingDiv';
const PRODUCT_CARD_SELECTOR = '.catalog-grid_new__item';
const PRODUCT_CARD_RATING_SELECTOR = '.rating-number';

const minRatingValue = +(localStorage.getItem(MIN_RATING_LOCAL_STORAGE_KEY) ?? MIN_RATING);

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

function appendFilterControlsIfNeeded(filtersBlockContainer) {
    const minRatingDiv = getFirstElement(filtersBlockContainer, `#${MIN_RATING_DIV_ID}`);

    if (minRatingDiv) {
        return;
    }

    appendFilterControls(filtersBlockContainer);
}

function appendFilterControls(filtersBlockContainer) {
    const controlStyle = 'margin-left: 10px;';
    const inputStyle =
        'border: 1px solid #C9C9C9;' +
        'border-radius: 8px;' +
        'height: 40px;' +
        'padding: 0 16px;';

    const minRatingDiv =
        createDefaultFilterControl('Минимальный рейтинг: ',
            minRatingValue,
            '0.1',
            '4.0',
            '5.0',
            updateMinRatingInput,
            controlStyle,
            inputStyle);

    minRatingDiv.id = MIN_RATING_DIV_ID;
    filtersBlockContainer.prepend(minRatingDiv);
}

function updateMinRatingInput(e) {
    updateInput(MIN_RATING_LOCAL_STORAGE_KEY, e);
}

function cleanList() {
    const productCards = getAllElements(document, PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
            const productCardRating = getFirstElement(productCard, PRODUCT_CARD_RATING_SELECTOR);

            if (!productCardRating) {
                productCard.remove();
            }

            const productCardRatingNumber = getElementInnerNumber(productCardRating);

            if (productCardRatingNumber < minRatingValue) {
                productCard.remove();
            }
        },
    );
}
