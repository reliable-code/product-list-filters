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
    createNoRatingFilterControl,
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../common/filter';

const PAGINATOR_CONTENT_SELECTOR = '#paginatorContent';
const PRODUCT_REVIEWS_WRAP_SELECTOR = '[data-widget="webSingleProductScore"]';
const COMMENTS_SELECTOR = '#comments';

const SEARCH_RESULTS_SORT_SELECTOR = '[data-widget="searchResultsSort"]';
const PRODUCT_CARDS_SELECTOR = '.widget-search-result-container > div > div';
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
const noRatingFilter =
    new StorageValue(`${CATEGORY_NAME}-no-rating-filter`, false, cleanList);
const filterEnabled =
    new StorageValue(`${CATEGORY_NAME}-filter-enabled`, true, cleanList);

function getCategoryName() {
    const { pathname } = window.location;
    const pathElements = pathname.split('/');
    const categoryName = pathElements[2] ?? 'common';

    return categoryName;
}

function getProductArticleFromPathname() {
    const { pathname } = window.location;
    return getProductArticleFromUrl(pathname);
}

function getProductArticleFromUrl(pathname) {
    const pathElements = pathname.split('/');
    const productLinkName = pathElements[2];

    if (!productLinkName) {
        console.log('No product article in path');
        return null;
    }

    const productArticle = productLinkName.split('-')
        .at(-1);
    return productArticle;
}

const paginatorContent = getFirstElement(PAGINATOR_CONTENT_SELECTOR);
const comments = getFirstElement(COMMENTS_SELECTOR);

if (paginatorContent) {
    initListClean();
} else if (comments) {
    comments.scrollIntoView();
} else {
    appendAdditionalProductPageControls();
}

function initListClean() {
    waitForElement(document, SEARCH_RESULTS_SORT_SELECTOR)
        .then((searchResultsSort) => {
            appendFilterControlsIfNeeded(searchResultsSort, appendFiltersContainer);

            window.addEventListener('storage', cleanList);

            const observer = new MutationObserver(cleanList);

            observer.observe(paginatorContent, {
                childList: true,
                subtree: true,
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

    const noRatingDiv =
        createNoRatingFilterControl(noRatingFilter, controlStyle, checkboxInputStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    filtersContainer.append(
        nameFilterDiv, minReviewsDiv, maxReviewsDiv, minRatingDiv, noRatingDiv, filterEnabledDiv,
    );

    parentNode.append(filtersContainer);

    parentNode.style =
        'position: sticky;' +
        'top: 62px;' +
        'background-color: #fff;' +
        'z-index: 2;' +
        'padding-bottom: 11px;' +
        'margin-bottom: 0;' +
        'gap: 15px;';
}

function cleanList() {
    const productCards = getAllElements(PRODUCT_CARDS_SELECTOR, paginatorContent);

    productCards.forEach(
        (productCard) => {
            if (!filterEnabled.value) {
                showElement(productCard, 'flex');

                return;
            }

            const productCardLink =
                getFirstElement('a', productCard);

            if (!productCardLink) {
                hideElement(productCard);
                return;
            }

            const productCardLinkHref = productCardLink.getAttribute('href');
            const productArticle = getProductArticleFromUrl(productCardLinkHref);

            const productCardNameWrap =
                getFirstElement(PRODUCT_CARD_NAME_SELECTOR, productCard);

            if (!productCardNameWrap) {
                hideElement(productCard);
                return;
            }

            const productCardRatingWrap =
                getFirstElement(PRODUCT_CARD_RATING_WRAP_SELECTOR, productCard);

            let productCardReviewsNumber;
            let productCardRatingNumber;

            if (!productCardRatingWrap) {
                const anyRatingFilterHasValue =
                    minReviewsFilter.value || maxReviewsFilter.value || minRatingFilter.value;

                if (anyRatingFilterHasValue && !noRatingFilter.value) {
                    hideElement(productCard);
                    return;
                }
            } else {
                const productCardRatingWrapSpans =
                    getAllElements(':scope > span', productCardRatingWrap, true);

                productCardReviewsNumber =
                    getArrayElementInnerNumber(productCardRatingWrapSpans, 1, true);

                const storedRatingValue = getStoredRatingValue(productArticle);

                if (!storedRatingValue) {
                    productCardRatingNumber =
                        getArrayElementInnerNumber(productCardRatingWrapSpans, 0);
                } else {
                    productCardRatingNumber = storedRatingValue;

                    productCardRatingWrapSpans[0].children[1].textContent =
                        storedRatingValue.padEnd(5);
                }

                productCardRatingWrap.title =
                    `Рейтинг: ${productCardRatingNumber}\n` +
                    `Отзывов: ${productCardReviewsNumber}\n`;
            }

            const productCardName = productCardNameWrap.innerText;

            productCardNameWrap.title = productCardName;

            const conditionToHide =
                isNotMatchTextFilter(productCardName, nameFilter) ||
                isLessThanFilter(productCardReviewsNumber, minReviewsFilter) ||
                isGreaterThanFilter(productCardReviewsNumber, maxReviewsFilter) ||
                isLessThanFilter(productCardRatingNumber, minRatingFilter);
            showHideElement(productCard, conditionToHide, 'flex');
        },
    );
}

function appendAdditionalProductPageControls() {
    waitForElement(document, PRODUCT_REVIEWS_WRAP_SELECTOR)
        .then((productReviewsWrap) => {
            if (!productReviewsWrap) return;

            appendBadReviewsLink(productReviewsWrap);
            appendRatingValue(productReviewsWrap);
            appendDislikeButton(productReviewsWrap);
        });
}


function getProductReviewsInfoClassList(productReviewsWrap) {
    return getFirstElement('.tsBodyControl500Medium', productReviewsWrap).classList;
}
function appendBadReviewsLink(productReviewsWrap) {
    const productReviewsLink = getFirstElement('a', productReviewsWrap);

    if (productReviewsLink) {
        const productReviewsWrapParent = productReviewsWrap.parentNode;

        const productBadReviewsLinkWrap = createDiv();
        productBadReviewsLinkWrap.classList = getProductReviewsInfoClassList(productReviewsWrap);

        const productBadReviewsLink =
            createLink(
                `${productReviewsLink.href}?sort=score_asc`,
                thumbsDownIcon,
                'align-items: center; display: flex; color: rgba(0, 26, 52, 0.6);',
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
    const starsContainer = getStarsContainer(productReviewsWrap);

    const productArticle = getProductArticleFromPathname();
    const storedRatingValue = getStoredRatingValue(productArticle);

    if (storedRatingValue) {
        replaceRatingValue(starsContainer, storedRatingValue);
    }

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

                    setStoredRatingValue(productArticle, ratingValue);
                    replaceRatingValue(starsContainer, ratingValue);
                });
        });
}

function getStarsContainer(productReviewsWrap) {
    return productReviewsWrap.children[0].children[1];
}

function setStoredRatingValue(productArticle, ratingValue) {
    localStorage.setItem(`rate-${productArticle}`, ratingValue);
}

function getStoredRatingValue(productArticle) {
    return localStorage.getItem(`rate-${productArticle}`);
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

function replaceRatingValue(starsContainer, ratingValue) {
    const reviewsCountText = starsContainer.textContent.split(' • ')[1];
    starsContainer.textContent = [ratingValue, reviewsCountText].join(' • ');
}

function appendDislikeButton(productReviewsWrap) {
    const productReviewsWrapParent = productReviewsWrap.parentNode;

    const productDislikeButtonWrap = createDiv();

    const siblingClassList = productReviewsWrapParent.children[1].classList;
    productDislikeButtonWrap.classList = siblingClassList;

    const productDislikeButton =
        createLink(
            null,
            thumbsDownIcon,
            'align-items: center; display: inline-flex; color: rgba(0, 26, 52, 0.6); cursor: pointer;',
        );

    productDislikeButton.onclick = () => dislikeProduct(productReviewsWrap);

    const productDislikeButtonSpan = document.createElement('span');
    productDislikeButtonSpan.style = 'padding-left: 8px;';
    productDislikeButtonSpan.textContent = 'Дизлайк';

    productDislikeButton.append(productDislikeButtonSpan);

    productDislikeButtonWrap.append(productDislikeButton);

    insertAfter(productReviewsWrapParent, productDislikeButtonWrap);
}

function dislikeProduct(productReviewsWrap) {
    const productArticle = getProductArticleFromPathname();
    const starsContainer = getStarsContainer(productReviewsWrap);

    setStoredRatingValue(productArticle, '1.0');
    replaceRatingValue(starsContainer, '1.0');
}
