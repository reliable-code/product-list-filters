import {
    addGlobalStyle,
    createDiv,
    createLink,
    createSpan,
    getFirstElement,
    insertAfter,
    waitForElement,
} from '../../common/dom';
import {
    appendPriceHistory,
    createDislikeButton,
    getProductArticleFromPathname,
    getStoredRatingValue,
    setStoredRatingValue,
} from './common/common';
import { thumbsDownIcon } from './common/icons';
import { removeSpaces } from '../../common/string';

const PRODUCT_REVIEWS_WRAP_OLD_SELECTOR = '[data-widget="webReviewProductScore"]';
const PRODUCT_REVIEWS_WRAP_SELECTOR = '[data-widget="webSingleProductScore"]';
const CREATE_REVIEW_BUTTON_SELECTOR = '[data-widget="createReviewButton"]';

export function initAppendAdditionalControls() {
    waitForElement(document, `${PRODUCT_REVIEWS_WRAP_OLD_SELECTOR}, ${PRODUCT_REVIEWS_WRAP_SELECTOR}`)
        .then((productReviewsWrap) => {
            if (!productReviewsWrap) return;

            if (productReviewsWrap.matches(PRODUCT_REVIEWS_WRAP_OLD_SELECTOR)) {
                appendDislikeButton(productReviewsWrap, true);
                appendBadReviewsLink(productReviewsWrap, true);
                appendRatingValue(getStarsContainerOld(productReviewsWrap));
            } else {
                appendDislikeButton(productReviewsWrap);
                appendBadReviewsLink(productReviewsWrap);
                appendRatingValue(getStarsContainer(productReviewsWrap));
            }
        });

    initAppendPriceHistory();
    hideWebInstallmentPurchase();
    skipFirstGalleryVideo();
}

function appendDislikeButton(productReviewsWrap, isOld = false) {
    const productDislikeButtonWrap = createDiv();

    let starsContainer;

    if (isOld) {
        productDislikeButtonWrap.classList = 'tsBodyControl400Small';
        starsContainer = getStarsContainerOld(productReviewsWrap);
    } else {
        productDislikeButtonWrap.classList = getProductReviewsInfoClassList(productReviewsWrap);
        starsContainer = getStarsContainer(productReviewsWrap);
    }

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

function appendBadReviewsLink(productReviewsWrap, isOld = false) {
    const productReviewsLink = getFirstElement('a', productReviewsWrap);

    if (productReviewsLink) {
        const productBadReviewsLinkWrap = createDiv();
        if (isOld) {
            productBadReviewsLinkWrap.classList = 'tsBodyControl400Small';
        } else {
            productBadReviewsLinkWrap.classList =
                getProductReviewsInfoClassList(productReviewsWrap);
        }

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

function appendRatingValue(starsContainer) {
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

                    const ratingValueNumber = +ratingValue;
                    setStoredRatingValue(productArticle, ratingValueNumber);
                    replaceRatingValue(starsContainer, ratingValueNumber);
                });
        });
}

function getStarsContainerOld(productReviewsWrap) {
    return productReviewsWrap.children[0].children[0].children[1].children[0];
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

function initAppendPriceHistory() {
    waitForElement(document, '[data-widget="webPrice"]')
        .then((priceContainer) => {
            if (!priceContainer) return;

            const productArticle = getProductArticleFromPathname();
            appendPriceHistory(priceContainer, productArticle);
        });
}

function hideWebInstallmentPurchase() {
    addGlobalStyle(
        '[data-widget="webInstallmentPurchase"] {' +
        '   display: none;' +
        '}',
    );
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

            const observer = new MutationObserver(() => {
                observer.disconnect();
                secondGalleryItem.click();
            });

            observer.observe(firstGalleryItem, {
                childList: true,
                subtree: true,
            });
        });
}
