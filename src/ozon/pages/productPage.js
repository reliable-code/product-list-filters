import { waitForElement } from '../../common/dom/utils';
import { createDislikeButton } from './common/common';
import { thumbsDownIcon } from './common/icons';
import { removeSpaces } from '../../common/string';
import { getURLPathElementEnding } from '../../common/url';
import { createDiv, createLink, createSpan } from '../../common/dom/elementsFactory';
import { insertAfter } from '../../common/dom/manipulation';
import { getAllElements, getElementInnerNumber, getFirstElement } from '../../common/dom/helpers';
import { getStoredRatingValue, setStoredRatingValue } from '../db/db';
import { appendPriceHistory } from '../../common/priceHistory/manipulation';

const PRODUCT_REVIEWS_WRAP_SELECTOR = '[data-widget="webSingleProductScore"]';

export function initProductPageMods() {
    skipFirstGalleryVideo();
    extendProductNameMaxHeight();

    initAppendPriceHistory()
        .then(() => waitForElement(document, `${PRODUCT_REVIEWS_WRAP_SELECTOR}`))
        .then((productReviewsWrap) => {
            if (!productReviewsWrap) return;

            appendDislikeButton(productReviewsWrap);
            appendBadReviewsLink(productReviewsWrap);
            appendRatingValue(getStarsContainer(productReviewsWrap));
        });
}

function appendDislikeButton(productReviewsWrap) {
    const productDislikeButtonWrap = createDiv();

    productDislikeButtonWrap.classList = getProductReviewsInfoClassList(productReviewsWrap);

    const starsContainer = getStarsContainer(productReviewsWrap);
    const productDislikeButton =
        createDislikeButton(() => dislikeProduct(starsContainer));

    productDislikeButtonWrap.append(productDislikeButton);

    insertAfter(productReviewsWrap.parentNode, productDislikeButtonWrap);
}

function getProductReviewsInfoClassList(productReviewsWrap) {
    return getFirstElement('.tsBodyControl500Medium', productReviewsWrap).classList;
}

function getProductArticleFromPathname() {
    return getURLPathElementEnding(2, 'unknown');
}

function dislikeProduct(starsContainer) {
    const productArticle = getProductArticleFromPathname();

    setStoredRatingValue(productArticle, 1);
    replaceRatingValue(starsContainer, 1);
}

function appendBadReviewsLink(productReviewsWrap) {
    const productReviewsLink = getFirstElement('a', productReviewsWrap);

    if (productReviewsLink) {
        const productBadReviewsLinkWrap = createDiv();
        productBadReviewsLinkWrap.classList =
            getProductReviewsInfoClassList(productReviewsWrap);

        const style = {
            alignItems: 'center',
            display: 'flex',
            color: 'rgba(0, 26, 52, 0.6)',
        };

        const productBadReviewsLink =
            createLink(
                style,
                thumbsDownIcon,
                `${productReviewsLink.href}?sort=score_asc`,
            );

        const productBadReviewsLinkSpan =
            createSpan({ paddingLeft: '8px' }, 'Плохие отзывы');

        productBadReviewsLink.append(productBadReviewsLinkSpan);

        productBadReviewsLinkWrap.append(productBadReviewsLink);

        insertAfter(productReviewsWrap.parentNode, productBadReviewsLinkWrap);
    }
}

function appendRatingValue(starsContainer) {
    const productArticle = getProductArticleFromPathname();
    const storedRatingValue = getStoredRatingValue(productArticle);

    if (storedRatingValue) {
        replaceRatingValue(starsContainer, storedRatingValue);
    }

    waitForElement(document, '[data-widget="webReviewTabs"]')
        .then((reviewsContainer) => {
            const reviewsContainerColumns = getAllElements('[data-widget="column"]', reviewsContainer);
            const reviewsInfoContainer = reviewsContainerColumns[2];
            waitForElement(reviewsInfoContainer, ':scope > div:not([data-widget])')
                .then((ratingInfoContainer) => {
                    const ratingInfo = ratingInfoContainer.children[0];

                    if (!ratingInfo) return;

                    const ratingValue = getRatingValueFromRatingInfo(ratingInfo);

                    if (!ratingValue) return;

                    setStoredRatingValue(productArticle, ratingValue);
                    replaceRatingValue(starsContainer, ratingValue);
                });
        });
}

function getCountedRatingValueFromRatingInfoContainer(ratingInfo) {
    const ratingValueContainer = ratingInfo.children[0].children[1];

    const ratingValueSpan = ratingValueContainer.children[0];
    const ratingValue = getRatingValue(ratingValueSpan);

    return ratingValue;
}

function getRatingValueFromRatingInfo(ratingInfo) {
    const ratingCounters = ratingInfo.children[2].children;

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

    const ratingValueRounded = Math.round((ratingValue + Number.EPSILON) * 1000) / 1000;

    return ratingValueRounded;
}

function getStarsContainer(productReviewsWrap) {
    return productReviewsWrap.children[0].children[1];
}

function getRatingValue(ratingValueSpan) {
    let ratingValue;

    try {
        const ratingValueSpanArray = removeSpaces(ratingValueSpan.innerHTML)
            .split('/');

        ratingValue = ratingValueSpanArray.length === 2 ? ratingValueSpanArray[0] : null;
    } catch (e) {
        console.log(`Failed to get ratingValue: ${e.message}`);
    }

    return ratingValue;
}

function replaceRatingValue(starsContainer, ratingValue) {
    const starsContainerTextArray = starsContainer.textContent.split(' • ');
    const reviewsCountText = starsContainerTextArray[1] ?? starsContainerTextArray[0];
    starsContainer.textContent = [ratingValue, reviewsCountText].join(' • ');
}

async function initAppendPriceHistory() {
    const priceContainer = await waitForElement(document, '[data-widget="webPrice"]');
    if (!priceContainer) return;

    const productArticle = getProductArticleFromPathname();
    const priceSpan = getFirstElement('span', priceContainer);

    await appendPriceHistory(priceContainer, priceSpan, productArticle);
}

function skipFirstGalleryVideo() {
    waitForElement(document, '[data-widget="webGallery"]')
        .then((webGallery) => {
            const firstGalleryItem = getFirstElement('[data-index="0"]', webGallery);
            if (!firstGalleryItem) return;

            const secondGalleryItem = getFirstElement('[data-index="1"]', webGallery);
            if (!secondGalleryItem) return;

            const firstGalleryItemIsImage =
                [...secondGalleryItem.classList]
                    .every((ic) => firstGalleryItem.classList.contains(ic));

            if (firstGalleryItemIsImage) return;

            secondGalleryItem.click();
        });
}

function extendProductNameMaxHeight() {
    waitForElement(document, '[data-widget="webProductHeading"]')
        .then((webProductHeading) => {
            const productName = getFirstElement('h1', webProductHeading);

            productName.style.maxHeight = '90px';
        });
}
