import { getElementInnerNumber } from '../common/dom';

const MIN_RATING = 4.0;

const MIN_RATING_LOCAL_STORAGE_KEY = 'min-rating-filter';
const PRODUCT_CARD_LIST_SELECTOR = '.catalog-list';
const PRODUCT_CARD_SELECTOR = '.catalog-grid_new__item';
const PRODUCT_CARD_RATING_SELECTOR = '.rating-number';

const minRatingValue = +(localStorage.getItem(MIN_RATING_LOCAL_STORAGE_KEY) ?? MIN_RATING);

setTimeout(() => {
    const productCardList = document.querySelector(PRODUCT_CARD_LIST_SELECTOR);

    if (productCardList) {
        setInterval(cleanList, 500);
    }
}, 1000);

function cleanList() {
    const productCards = document.querySelectorAll(PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
            const productCardRating = productCard.querySelector(PRODUCT_CARD_RATING_SELECTOR);

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
