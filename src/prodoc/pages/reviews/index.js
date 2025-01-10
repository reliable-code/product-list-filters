import { appendDoctorPageAdditionalLinks } from '../common';
import { SELECTORS } from './selectors';
import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../../../common/dom/helpers';
import { waitForElement } from '../../../common/dom/utils';
import { createDiv, createLink } from '../../../common/dom/factories/elements';
import { getURLQueryStringParam } from '../../../common/url';

export async function initReviewsMods() {
    appendDoctorPageAdditionalLinks();
    const filters = await getFiltersData();
    const baseReviewsUrl = `${window.location.origin}${window.location.pathname}`;
    appendReviewsInfoToHeader(filters, baseReviewsUrl);
    if (getURLQueryStringParam('rates_category')) scrollToReviews();
}

async function getFiltersData() {
    const filterChip = getFirstElement(SELECTORS.FILTER_CHIP);
    filterChip.click();

    const filterList = await waitForElement(document, SELECTORS.FILTER_LIST);
    const filters = [...getAllElements(SELECTORS.FILTER_LIST_ITEM, filterList)]
        .map((filter) => {
            const categoryAttributeValue = filter.getAttribute('data-qa');
            if (!categoryAttributeValue) return null;
            const category = categoryAttributeValue.replace('reviews_filter_list_item_', '');

            const title = getFirstElement(SELECTORS.FILTER_TITLE_WRAP, filter)
                .textContent
                .trim();

            const countWrap = getFirstElement(SELECTORS.FILTER_COUNT_WRAP, filter);
            const count = getElementInnerNumber(countWrap, true);
            const { classList } = countWrap;

            return {
                category,
                title,
                count,
                classList,
            };
        });

    filterChip.click();

    return filters;
}

function appendReviewsInfoToHeader(filters, baseReviewsUrl) {
    const nameSpanHolder = getFirstElement(SELECTORS.NAME_SPAN_HOLDER, document, true);
    if (!nameSpanHolder) return;

    const nameSpan = getFirstElement(SELECTORS.NAME_SPAN, nameSpanHolder, true);
    if (!nameSpan) return;

    const reviewsInfo = createDiv({ gridGap: '6px' });
    reviewsInfo.classList.add('v-application');

    const reviewsInfoWrap = createDiv({
        height: '23px',
        marginTop: '5px',
    });

    reviewsInfoWrap.append(reviewsInfo);

    filters.forEach((filter) => {
        const link = `${baseReviewsUrl}?rates_category=${filter.category}`;
        const headerFilter = createLink(
            { textDecoration: 'none' }, `${filter.title} ${filter.count}`, link,
        );
        headerFilter.classList = filter.classList;
        reviewsInfo.append(headerFilter);
    });

    nameSpan.append(reviewsInfoWrap);
}

function scrollToReviews() {
    const reviewsContainer = getFirstElement(SELECTORS.REVIEWS_CONTAINER);
    reviewsContainer.scrollIntoView({ behavior: 'smooth' });
}
