import { debounce, waitForElement } from '../../../common/dom/utils';
import { createDislikeButton } from '../common';
import { thumbsDownIcon } from '../common/icons';
import { getURLPathElementEnding } from '../../../common/url';
import { createDiv, createLink, createSpan } from '../../../common/dom/factories/elements';
import { insertAfter } from '../../../common/dom/manipulation';
import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../../../common/dom/helpers';
import { getStoredRatingValue, setStoredRatingValue } from '../../db/db';
import { appendPriceHistory } from '../../../common/priceHistory/manipulation';

const SELECTORS = {
    PRODUCT_REVIEWS_WRAP: '[data-widget="webSingleProductScore"]',
    PRICE_CONTAINER: '[data-widget="webPrice"]',
    WEB_GALLERY: '[data-widget="webGallery"]',
    WEB_PRODUCT_HEADING: '[data-widget="webProductHeading"]',
};

export async function initProductPageMods() {
    await Promise.all([
        initAppendPriceHistory(),
        initSkipFirstGalleryVideo(),
        extendProductNameMaxHeight(),
    ]);

    const productReviewsWrap = await waitForElement(document, SELECTORS.PRODUCT_REVIEWS_WRAP);
    if (!productReviewsWrap) return;

    appendDislikeButton(productReviewsWrap);
    appendBadReviewsLink(productReviewsWrap);
    await appendRatingValue(getStarsContainer(productReviewsWrap));
}

async function initAppendPriceHistory() {
    const priceContainer = await waitForElement(document, SELECTORS.PRICE_CONTAINER);
    if (!priceContainer) return;

    const productArticle = getProductArticleFromPathname();
    const priceSpan = getFirstElement('span', priceContainer);

    await appendPriceHistory(priceContainer, priceSpan, productArticle);
}

function getProductArticleFromPathname() {
    return getURLPathElementEnding(2, 'unknown');
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

async function appendRatingValue(starsContainer) {
    const productArticle = getProductArticleFromPathname();
    const storedRatingValue = getStoredRatingValue(productArticle);

    if (storedRatingValue) {
        replaceRatingValue(starsContainer, storedRatingValue);
    }

    try {
        const reviewsContainer = await waitForElement(document, '[data-widget="webReviewTabs"]');
        const reviewsContainerColumns = getAllElements('[data-widget="column"]', reviewsContainer);
        const reviewsInfoContainer = reviewsContainerColumns[2];
        const ratingInfoContainer = await waitForElement(reviewsInfoContainer, ':scope > div:not([data-widget])');

        const ratingInfo = ratingInfoContainer?.children[0];
        if (!ratingInfo) return;

        const ratingValue = getRatingValueFromRatingInfo(ratingInfo);

        if (!ratingValue) return;

        setStoredRatingValue(productArticle, ratingValue);
        replaceRatingValue(starsContainer, ratingValue);
    } catch (error) {
        console.error('Error while appending rating value:', error);
    }
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

function replaceRatingValue(starsContainer, ratingValue) {
    const starsContainerTextArray = starsContainer.textContent.split(' • ');
    const reviewsCountText = starsContainerTextArray[1] ?? starsContainerTextArray[0];
    starsContainer.textContent = [ratingValue, reviewsCountText].join(' • ');
}
