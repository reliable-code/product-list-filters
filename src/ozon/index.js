import { thumbsDownIcon } from './icons';
import {
    addGlobalStyle,
    createDiv,
    createLink,
    getAllElements,
    getArrayElementInnerNumber,
    getFirstElement,
    hideElement,
    insertAfter,
    showElement,
    showHideElement,
    waitForElement,
} from '../common/dom';
import { StorageValue } from '../common/storage';
import { removeSpaces } from '../common/string';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMaxReviewsFilterControl,
    createMinRatingFilterControl,
    createMinReviewsFilterControl,
    createNameFilterControl,
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../common/filter';

const PAGINATOR_CONTENT_SELECTOR = '#paginatorContent';
const PRODUCT_REVIEWS_WRAP_SELECTOR = '[data-widget="webReviewProductScore"]';
const COMMENTS_SELECTOR = '#comments';

const SEARCH_RESULTS_SORT_SELECTOR = '[data-widget="searchResultsSort"]';
const PRODUCT_CARDS_WRAP_SELECTOR = '.widget-search-result-container > div';
const PRODUCT_CARD_NAME_SELECTOR = '.tsBody500Medium';
const PRODUCT_CARD_RATING_WRAP_SELECTOR = '.tsBodyMBold';
const CREATE_REVIEW_BUTTON_SELECTOR = '[data-widget="createReviewButton"]';

const CATEGORY_NAME = getCategoryName();

const nameFilter =
    new StorageValue(`${CATEGORY_NAME}-name-filter`, null, cleanList);
const minReviewsFilter =
    new StorageValue(`${CATEGORY_NAME}-min-reviews-filter`, null, cleanList);
const maxReviewsFilter =
    new StorageValue(`${CATEGORY_NAME}-max-reviews-filter`, null, cleanList);
const minRatingFilter =
    new StorageValue(`${CATEGORY_NAME}-min-rating-filter`, 4.8, cleanList);
const filterEnabled =
    new StorageValue(`${CATEGORY_NAME}-filter-enabled`, true, cleanList);

function getCategoryName() {
    const { pathname } = window.location;
    const pathElements = pathname.split('/');
    const categoryName = pathElements[2] ?? 'common';

    return categoryName;
}

const paginatorContent = getFirstElement(PAGINATOR_CONTENT_SELECTOR);
const comments = getFirstElement(COMMENTS_SELECTOR);

if (paginatorContent) {
    initListClean();
} else if (comments) {
    comments.scrollIntoView();
} else {
    appendBadReviewsLinkAndRatingValue();
}

function initListClean() {
    waitForElement(document, SEARCH_RESULTS_SORT_SELECTOR)
        .then((searchResultsSort) => {
            appendFilterControlsIfNeeded(searchResultsSort, appendFiltersContainer);

            const productCardsWrap = getFirstElement(PRODUCT_CARDS_WRAP_SELECTOR, document, true);
            const observer = new MutationObserver(cleanList);

            observer.observe(productCardsWrap, {
                childList: true,
            });
        });
}

function appendFiltersContainer(filtersContainer, parentNode) {
    addGlobalStyle(
        'input[type=number]::-webkit-inner-spin-button,' +
        'input[type=number]::-webkit-outer-spin-button {' +
        '    -webkit-appearance: auto;' +
        '}',
    );

    filtersContainer.style =
        'display: flex;' +
        'grid-gap: 15px;' +
        'margin-top: 14px;';

    const controlStyle =
        'display: flex;' +
        'align-items: center;';
    const inputStyle =
        'margin-left: 5px;' +
        'border: 2px solid #b3bcc5;' +
        'border-radius: 6px;' +
        'padding: 6px 10px;';
    const textInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 190px;';
    const numberInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 90px;';
    const checkboxInputStyle =
        'margin-left: 5px;' +
        'width: 25px;' +
        'height: 25px;';

    const nameFilterDiv =
        createNameFilterControl(nameFilter, controlStyle, textInputStyle);

    const minReviewsDiv =
        createMinReviewsFilterControl(minReviewsFilter, controlStyle, numberInputStyle);

    const maxReviewsDiv =
        createMaxReviewsFilterControl(maxReviewsFilter, controlStyle, numberInputStyle);

    const minRatingDiv =
        createMinRatingFilterControl(minRatingFilter, controlStyle, numberInputStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    filtersContainer.append(
        nameFilterDiv, minReviewsDiv, maxReviewsDiv, minRatingDiv, filterEnabledDiv,
    );

    parentNode.append(filtersContainer);

    parentNode.style =
        'position: sticky;' +
        'top: 62px;' +
        'background-color: #fff;' +
        'z-index: 1;' +
        'padding-bottom: 11px;' +
        'margin-bottom: 0;';
}

function cleanList() {
    const productCardsWrap = getFirstElement(PRODUCT_CARDS_WRAP_SELECTOR, document, true);
    const productCards = getAllElements(':scope > div', productCardsWrap);

    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                showElement(productCard, 'flex');

                return;
            }

            const productCardNameWrap =
                getFirstElement(PRODUCT_CARD_NAME_SELECTOR, productCard);

            const productCardRatingWrap =
                getFirstElement(PRODUCT_CARD_RATING_WRAP_SELECTOR, productCard);

            if (!productCardNameWrap || !productCardRatingWrap) {
                hideElement(productCard);
                return;
            }

            const productCardName = productCardNameWrap.innerText;

            const productCardRatingWrapSpans =
                getAllElements(':scope > span', productCardRatingWrap, true);

            const productCardReviewsNumber =
                getArrayElementInnerNumber(productCardRatingWrapSpans, 1, true);

            const productCardRatingNumber =
                getArrayElementInnerNumber(productCardRatingWrapSpans, 0);

            productCardNameWrap.title = productCardName;

            productCardRatingWrap.title =
                `Рейтинг: ${productCardRatingNumber}\n` +
                `Отзывов: ${productCardReviewsNumber}\n`;

            const conditionToHide =
                isNotMatchTextFilter(productCardName, nameFilter) ||
                isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
                isGreaterThanFilter(productCardReviewsNumber, maxReviewsFilter) ||
                isLessThanFilter(productCardRatingNumber, minRatingFilter);
            showHideElement(productCard, conditionToHide, 'flex');
        },
    );
}

function appendBadReviewsLinkAndRatingValue() {
    waitForElement(document, PRODUCT_REVIEWS_WRAP_SELECTOR)
        .then((productReviewsWrap) => {
            if (!productReviewsWrap) return;

            appendBadReviewsLink(productReviewsWrap);
            appendRatingValue(productReviewsWrap);
        });
}

function appendBadReviewsLink(productReviewsWrap) {
    const productReviewsLink = getFirstElement('a', productReviewsWrap);

    if (productReviewsLink) {
        const productReviewsWrapParent = productReviewsWrap.parentNode;

        const productBadReviewsLinkWrap = createDiv();

        const productBadReviewsLink =
            createLink(
                `${productReviewsLink.href}?sort=score_asc`,
                thumbsDownIcon,
                'align-items: center; display: flex;',
            );

        const productBadReviewsLinkSpan = document.createElement('span');
        productBadReviewsLinkSpan.style = 'padding-left: 8px;';
        productBadReviewsLinkSpan.textContent = 'Плохие отзывы';

        productBadReviewsLink.append(productBadReviewsLinkSpan);

        productBadReviewsLinkWrap.append(productBadReviewsLink);

        const isInStickyContainer =
            productReviewsWrapParent.parentNode.matches('[data-widget="stickyContainer"]');

        if (isInStickyContainer) {
            productBadReviewsLinkWrap.style = 'margin-top: 10px;';

            insertAfter(productReviewsWrapParent, productBadReviewsLinkWrap);
        } else {
            insertAfter(productReviewsWrap, productBadReviewsLinkWrap);
        }
    }
}

function appendRatingValue(productReviewsWrap) {
    waitForElement(document, CREATE_REVIEW_BUTTON_SELECTOR)
        .then((createReviewButton) => {
            const reviewsInfoContainer = createReviewButton.parentNode;

            waitForElement(reviewsInfoContainer, ':scope > div:not([data-widget]')
                .then((ratingInfoContainer) => {
                    const ratingValueContainer =
                        ratingInfoContainer.children[0].children[0].children[1];

                    const ratingValueSpan = ratingValueContainer.children[0];
                    const ratingValue = getRatingValue(ratingValueSpan);

                    if (!ratingValue) return;

                    const starsContainer = productReviewsWrap.children[0].children[0].children[0];

                    const ratingValueDivStyle = 'margin: 0 4px; color: #005bff;';
                    const ratingValueDiv = createDiv(ratingValue, ratingValueDivStyle);

                    starsContainer.append(ratingValueDiv);
                });
        });
}

function getRatingValue(ratingValueSpan) {
    let ratingValue;

    try {
        [ratingValue] =
            removeSpaces(ratingValueSpan.innerHTML)
                .split('/');
    } catch (e) {
        console.log(`Failed to get ratingValue: ${e.message}`);
    }

    return ratingValue;
}
