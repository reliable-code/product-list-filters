import {
    appendDoctorPageAdditionalLinks,
    appendReviewsInfoBlockToHeader,
    createReviewsInfoBlock,
} from '../common';
import { SELECTORS } from './selectors';
import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../../../common/dom/helpers';
import { waitForElement } from '../../../common/dom/utils';
import { getURLQueryStringParam } from '../../../common/url';

export async function initReviewsMods() {
    appendDoctorPageAdditionalLinks();
    const reviewsData = await getReviewsData();
    const baseReviewsUrl = `${window.location.origin}${window.location.pathname}`;
    const reviewsInfoBlock = createReviewsInfoBlock(reviewsData, baseReviewsUrl);
    appendReviewsInfoBlockToHeader(reviewsInfoBlock);
    if (getURLQueryStringParam('rates_category')) scrollToReviews();
}

async function getReviewsData() {
    const filterChip = getFirstElement(SELECTORS.FILTER_CHIP);
    filterChip.click();

    const filterList = await waitForElement(document, SELECTORS.FILTER_LIST);
    const reviewsData = [...getAllElements(SELECTORS.FILTER_LIST_ITEM, filterList)]
        .map((filter) => {
            const categoryAttributeValue = filter.getAttribute('data-qa');
            if (!categoryAttributeValue) return null;
            const category = categoryAttributeValue.replace('reviews_filter_list_item_', '');

            const title = getFirstElement(SELECTORS.FILTER_TITLE_WRAP, filter)
                .textContent
                .trim();

            const countWrap = getFirstElement(SELECTORS.FILTER_COUNT_WRAP, filter);
            const count = getElementInnerNumber(countWrap, true);
            const classes = countWrap.classList.value;

            return {
                category,
                title,
                count,
                classes,
            };
        });

    filterChip.click();

    return reviewsData;
}

function scrollToReviews() {
    const reviewsContainer = getFirstElement(SELECTORS.REVIEWS_CONTAINER);
    reviewsContainer.scrollIntoView({ behavior: 'smooth' });
}
