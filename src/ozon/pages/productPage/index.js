import { debounce, waitForElement } from '../../../common/dom/utils';
import { createDislikeButton, getProductArticleFromPathname } from '../common';
import { thumbsDownIcon } from '../common/icons';
import { createDiv, createLink, createSpan } from '../../../common/dom/factories/elements';
import { insertAfter } from '../../../common/dom/manipulation';
import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../../../common/dom/helpers';
import { appendPriceHistory } from '../../../common/priceHistory/manipulation';
import { SELECTORS } from './selectors';
import { STYLES } from './styles';
import { initReviewsMods } from '../reviews';
import { roundToPrecision } from '../../../common/mathUtils';
import { getStoredRating, setStoredRating } from '../../../common/db/specific';
import { getURLQueryParam, setQueryParamsAndRedirect } from '../../../common/url';

export async function initProductPageMods() {
    const needScrollToComments = getURLQueryParam('scrollTo') === 'comments';
    await Promise.all([
        hideUnwantedElements(),
        initAppendPriceHistory(),
        initSkipFirstGalleryVideo(),
        extendProductNameMaxHeight(),
        appendDislikeButton(),
        appendBadReviewsLink(),
        appendRatingValue(),
        initReviewsMods(needScrollToComments, true),
    ]);
}

function hideUnwantedElements() {
    const pricePerStars = getFirstElement(SELECTORS.PRICE_PER_STARS);
    if (pricePerStars) {
        pricePerStars.parentNode.style.display = 'none';
    }
}

async function initAppendPriceHistory() {
    const priceContainer = await waitForElement(document, SELECTORS.PRICE_CONTAINER);
    if (!priceContainer) return;

    const productArticle = getProductArticleFromPathname();
    const priceSpan = getFirstElement('span', priceContainer);

    await appendPriceHistory(priceContainer, priceSpan, productArticle, isProductUnavailable());
}

function isProductUnavailable() {
    const addToCartButton = getFirstElement(SELECTORS.ADD_TO_CART_BUTTON);
    if (!addToCartButton) return true;

    const buttonText = addToCartButton.textContent.trim();

    return buttonText === 'Узнать о поступлении';
}

async function initSkipFirstGalleryVideo() {
    const webGallery = await waitForElement(document, SELECTORS.WEB_GALLERY);
    if (!webGallery) return;

    const observer = new MutationObserver(debounce(() => {
        skipFirstGalleryVideo(webGallery);
        observer.disconnect();
    }));

    observer.observe(webGallery, {
        childList: true,
        subtree: true,
    });
}

function skipFirstGalleryVideo(webGallery) {
    const firstGalleryItem = getFirstElement('[data-index="0"]', webGallery);
    if (!firstGalleryItem) return;

    const secondGalleryItem = getFirstElement('[data-index="1"]', webGallery);
    if (!secondGalleryItem) return;

    const firstGalleryItemIsImage =
        [...secondGalleryItem.classList]
            .every((ic) => firstGalleryItem.classList.contains(ic));

    if (firstGalleryItemIsImage) return;

    secondGalleryItem.click();
}

async function extendProductNameMaxHeight() {
    const webProductHeading = await waitForElement(document, SELECTORS.WEB_PRODUCT_HEADING);
    if (!webProductHeading) return;

    const productName = getFirstElement('h1', webProductHeading);
    if (productName) productName.style.maxHeight = '90px';
}

async function appendDislikeButton() {
    const reviewsWrap = await waitForElement(document, SELECTORS.PRODUCT_REVIEWS_WRAP);
    const dislikeButtonWrap = createDiv();

    dislikeButtonWrap.classList = getReviewsInfoClassList(reviewsWrap);

    const starsContainer = getStarsContainer(reviewsWrap);
    const dislikeButton = createDislikeButton(
        () => dislikeProduct(starsContainer),
    );

    dislikeButtonWrap.append(dislikeButton);

    insertAfter(reviewsWrap.parentNode, dislikeButtonWrap);
}

function getReviewsInfoClassList(reviewsWrap) {
    return getFirstElement(SELECTORS.PRODUCT_REVIEWS_INFO, reviewsWrap).classList;
}

function getStarsContainer(reviewsWrap) {
    return reviewsWrap.children[0].children[1];
}

function dislikeProduct(starsContainer) {
    const productArticle = getProductArticleFromPathname();

    setStoredRating(productArticle, 1);
    replaceRating(starsContainer, 1);
}

function replaceRating(starsContainer, rating) {
    const SEPARATOR = ' • ';

    const starsContainerTextParts = starsContainer.textContent.split(SEPARATOR);
    const reviewsCountText = starsContainerTextParts[1] || starsContainerTextParts[0];
    starsContainer.textContent = [rating, reviewsCountText].join(SEPARATOR);
}

async function appendBadReviewsLink() {
    const reviewsWrap = await waitForElement(document, SELECTORS.PRODUCT_REVIEWS_WRAP);
    const reviewsLink = getFirstElement('a', reviewsWrap);
    if (!reviewsLink) return;

    const badReviewsLinkWrap = createDiv();
    badReviewsLinkWrap.classList = getReviewsInfoClassList(reviewsWrap);

    const badReviewsLink = createLink(
        STYLES.BAD_REVIEWS_LINK, thumbsDownIcon, `${reviewsLink.href}?sort=score_asc`,
    );
    badReviewsLink.addEventListener('click', (event) => {
        event.preventDefault();
        redirectToBadReviews();
    });
    const badReviewsLinkSpan = createSpan(
        STYLES.BAD_REVIEWS_LINK_SPAN, 'Плохие отзывы',
    );
    badReviewsLink.append(badReviewsLinkSpan);
    badReviewsLinkWrap.append(badReviewsLink);
    insertAfter(reviewsWrap.parentNode, badReviewsLinkWrap);
}

function redirectToBadReviews() {
    setQueryParamsAndRedirect({
        sort: 'score_asc',
        scrollTo: 'comments',
    });
}

async function appendRatingValue() {
    const reviewsWrap = await waitForElement(document, SELECTORS.PRODUCT_REVIEWS_WRAP);
    const starsContainer = getStarsContainer(reviewsWrap);
    const productArticle = getProductArticleFromPathname();
    const storedRating = getStoredRating(productArticle);

    if (storedRating) {
        replaceRating(starsContainer, storedRating);
    }

    try {
        const reviewsContainer = await waitForElement(document, SELECTORS.REVIEWS_CONTAINER);
        const reviewsContainerColumns = getAllElements(
            SELECTORS.REVIEWS_CONTAINER_COLUMNS, reviewsContainer,
        );
        const reviewsInfoContainer = reviewsContainerColumns[2];
        const ratingInfoContainer = await waitForElement(
            reviewsInfoContainer, ':scope > div:not([data-widget])',
        );

        const ratingInfo = ratingInfoContainer?.children[0];
        if (!ratingInfo) return;

        const ratingValue = getRatingValueFromRatingInfo(ratingInfo);
        if (!ratingValue) return;

        setStoredRating(productArticle, ratingValue);
        replaceRating(starsContainer, ratingValue);
    } catch (error) {
        console.error('Error while appending rating value:', error);
    }
}

function getRatingValueFromRatingInfo(ratingInfo) {
    const ratingCounters = ratingInfo?.children?.[2]?.children;

    if (!ratingCounters) return null;

    let reviewCounterSum = 0;
    let ratingWeightSum = 0;

    [...ratingCounters].forEach((ratingCounter) => {
        const ratingWrap = ratingCounter.children[0];
        const rating = getElementInnerNumber(ratingWrap, true);

        const reviewCounterWrap = ratingCounter.children[2];
        const reviewCounter = getElementInnerNumber(reviewCounterWrap);

        const ratingWeight = rating * reviewCounter;

        reviewCounterSum += reviewCounter;
        ratingWeightSum += ratingWeight;
    });

    if (!reviewCounterSum) return null;

    const ratingValue = ratingWeightSum / reviewCounterSum;

    return roundToPrecision(ratingValue);
}
