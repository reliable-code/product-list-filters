import {
    appendDoctorPageAdditionalLinks,
    appendReviewsInfoBlockToHeader,
    createReviewsInfoBlock,
    getDoctorIdFromPathname,
} from '../common';
import { SELECTORS } from './selectors';
import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../../../common/dom/helpers';
import { waitForElement } from '../../../common/dom/utils';
import { getURLQueryStringParam } from '../../../common/url';
import { setStoredReviewsData } from '../../db';

export async function initReviewsMods() {
    appendDoctorPageAdditionalLinks();

    const reviewsData = await getReviewsData();

    setStoredReviewsData(getDoctorIdFromPathname(), reviewsData);

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
            const bgClassSuffix = parseBgClassSuffix(countWrap.classList);

            return {
                category,
                title,
                count,
                bgClassSuffix,
            };
        });

    filterChip.click();

    return reviewsData;
}

function parseBgClassSuffix(classList) {
    const match = classList.value.match(/ui-kit-bg-bg-(\w+)/);
    return match ? match[1] : null;
}

function scrollToReviews() {
    const reviewsContainer = getFirstElement(SELECTORS.REVIEWS_CONTAINER);
    reviewsContainer.scrollIntoView({ behavior: 'smooth' });
}
