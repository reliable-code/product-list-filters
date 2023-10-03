import {
    createDefaultFilterControl,
    getAllElements,
    getElementInnerNumber,
    getFirstElement, updateInput
} from '../common/dom';

const MIN_RATING = 4.0;

const MIN_RATING_LOCAL_STORAGE_KEY = 'min-rating-filter';
const PRODUCT_CARD_LIST_SELECTOR = '.catalog-list';
const PRODUCT_CARD_SELECTOR = '.catalog-grid_new__item';
const PRODUCT_CARD_RATING_SELECTOR = '.rating-number';

const minRatingValue = +(localStorage.getItem(MIN_RATING_LOCAL_STORAGE_KEY) ?? MIN_RATING);

setTimeout(() => {
    const productCardList = getFirstElement(document, PRODUCT_CARD_LIST_SELECTOR);

    if (productCardList) {
        appendFilterControls(productCardList);

        setInterval(cleanList, 500);
    }
}, 1000);

function appendFilterControls(filtersBlockContainer) {
    const controlStyle = '';

    const minRatingDiv =
        createDefaultFilterControl('Минимальный рейтинг: ', minRatingValue, '0.1', '4.0', '5.0', updateMinRatingInput, controlStyle);

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
