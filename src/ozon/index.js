import { heartStrikeDislikeIcon, thumbsDownIcon } from './icons';
import {
    addGlobalStyle,
    createDiv,
    createLink,
    createSpan,
    getAllElements,
    getArrayElementInnerNumber,
    getFirstElement,
    getNodeInnerNumber,
    hideElement,
    insertAfter,
    showElement,
    showHideElement,
    waitForElement,
} from '../common/dom';
import { getStorageValue, setStorageValue, StorageValue } from '../common/storage';
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

            const productArticle = getProductArticleFromLink(productCardLink);

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

function getProductArticleFromLink(productCardLink) {
    const productCardLinkHref = productCardLink.getAttribute('href');
    return getProductArticleFromUrl(productCardLinkHref);
}
function appendAdditionalProductPageControls() {
    waitForElement(document, PRODUCT_REVIEWS_WRAP_SELECTOR)
        .then((productReviewsWrap) => {
            if (!productReviewsWrap) return;

            appendDislikeButton(productReviewsWrap);
            appendBadReviewsLink(productReviewsWrap);
            appendRatingValue(productReviewsWrap);
        });

    appendPriceHistory();
}

function appendDislikeButton(productReviewsWrap) {
    const productDislikeButtonWrap = createDiv();

    productDislikeButtonWrap.classList = getProductReviewsInfoClassList(productReviewsWrap);

    const productDislikeButton =
        createLink(
            null,
            heartStrikeDislikeIcon,
            'align-items: center; display: inline-flex; color: rgba(0, 26, 52, 0.6); cursor: pointer;',
        );

    productDislikeButton.onclick = () => dislikeProduct(productReviewsWrap);

    const productDislikeButtonSpan = createSpan('Дизлайк', 'padding-left: 8px;');

    productDislikeButton.append(productDislikeButtonSpan);

    productDislikeButtonWrap.append(productDislikeButton);

    insertAfter(productReviewsWrap.parentNode, productDislikeButtonWrap);
}

function getProductReviewsInfoClassList(productReviewsWrap) {
    return getFirstElement('.tsBodyControl500Medium', productReviewsWrap).classList;
}

function dislikeProduct(productReviewsWrap) {
    const productArticle = getProductArticleFromPathname();
    const starsContainer = getStarsContainer(productReviewsWrap);

    setStoredRatingValue(productArticle, '1');
    replaceRatingValue(starsContainer, '1');
}

function appendBadReviewsLink(productReviewsWrap) {
    const productReviewsLink = getFirstElement('a', productReviewsWrap);

    if (productReviewsLink) {
        const productBadReviewsLinkWrap = createDiv();
        productBadReviewsLinkWrap.classList = getProductReviewsInfoClassList(productReviewsWrap);

        const productBadReviewsLink =
            createLink(
                `${productReviewsLink.href}?sort=score_asc`,
                thumbsDownIcon,
                'align-items: center; display: flex; color: rgba(0, 26, 52, 0.6);',
            );

        const productBadReviewsLinkSpan = createSpan('Плохие отзывы', 'padding-left: 8px;');

        productBadReviewsLink.append(productBadReviewsLinkSpan);

        productBadReviewsLinkWrap.append(productBadReviewsLink);

        insertAfter(productReviewsWrap.parentNode, productBadReviewsLinkWrap);
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
    setStorageValue(productArticle, ratingValue, 'rate');
}

function getStoredRatingValue(productArticle) {
    return getStorageValue(productArticle, 'rate');
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

function appendPriceHistory() {
    waitForElement(document, '[data-widget="webPrice"]')
        .then((priceContainer) => {
            if (!priceContainer) return;

            const priceSpan = getFirstElement('span', priceContainer);
            const currentPrice = getNodeInnerNumber(priceSpan, true);

            const productArticle = getProductArticleFromPathname();

            appendStoredPriceValue(
                productArticle,
                'lp',
                (storedPriceValue) => currentPrice < storedPriceValue,
                currentPrice,
                'Мин. цена',
                '#d6f5b1',
                priceContainer,
            );

            appendStoredPriceValue(
                productArticle,
                'hp',
                (storedPriceValue) => currentPrice > storedPriceValue,
                currentPrice,
                'Макс. цена',
                '#fed2ea',
                priceContainer,
            );
        });
}

function appendStoredPriceValue(
    productArticle, prefix, compareCondition, currentPrice, label, color, priceContainer,
) {
    let storedPriceValue = getStorageValue(productArticle, prefix);

    if (!storedPriceValue || compareCondition(storedPriceValue)) {
        setStorageValue(productArticle, currentPrice, prefix);
        storedPriceValue = currentPrice;
    }
    const divText = `${label}: `;
    const divStyle =
        'font-size: 16px;' +
        'padding: 17px 0px 7px;';
    const storedPriceContainer = createDiv(divText, divStyle);

    const spanText = `${storedPriceValue.toLocaleString()} ₽`;
    const spanStyle =
        'font-weight: bold;' +
        'padding: 6px 12px;' +
        'border-radius: 8px;' +
        `background: ${color};`;
    const storedPriceSpan = createSpan(spanText, spanStyle);

    storedPriceContainer.append(storedPriceSpan);
    priceContainer.append(storedPriceContainer);
}
