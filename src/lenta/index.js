import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    showElement,
    showHideElement,
} from '../common/dom';
import { StorageValue } from '../common/storage';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMinRatingFilterControl,
    createNoRatingFilterControl,
} from '../common/filter';

const minRatingFilter = new StorageValue('min-rating-filter', 4.0);
const noRatingFilter = new StorageValue('no-rating-filter', false);
const filterEnabled = new StorageValue('filter-enabled', true);

const PRODUCT_CARD_LIST_SELECTOR = '.catalog-list';
const PRODUCT_CARD_SELECTOR = '.catalog-grid_new__item';
const PRODUCT_CARD_RATING_SELECTOR = '.rating-number';

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
            minRatingFilter.value,
            minRatingFilter.updateValueFromEvent,
            controlStyle,
            numberInputStyle,
        );

    const noRatingDiv =
        createNoRatingFilterControl(
            noRatingFilter.value,
            noRatingFilter.updateValueFromEvent,
            controlStyle,
            checkboxInputStyle,
        );

    const filterEnabledDiv =
        createEnabledFilterControl(
            filterEnabled.value,
            filterEnabled.updateValueFromEvent,
            controlStyle,
            checkboxInputStyle,
        );

    filtersContainer.append(minRatingDiv, noRatingDiv, filterEnabledDiv);

    parentNode.prepend(filtersContainer);
}

function cleanList() {
    const productCards = getAllElements(PRODUCT_CARD_SELECTOR);

    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                showElement(productCard);

                return;
            }

            const productCardRating = getFirstElement(PRODUCT_CARD_RATING_SELECTOR, productCard);

            if (!productCardRating) {
                showHideElement(productCard, !noRatingFilter.value);

                return;
            }

            const productCardRatingNumber = getElementInnerNumber(productCardRating);

            showHideElement(productCard, productCardRatingNumber < minRatingFilter.value);
        },
    );
}
