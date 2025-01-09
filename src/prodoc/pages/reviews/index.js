import { appendDoctorPageAdditionalLinks } from '../common';
import { SELECTORS } from './selectors';
import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../../../common/dom/helpers';
import { waitForElement } from '../../../common/dom/utils';
import { createDiv, createSpan } from '../../../common/dom/factories/elements';

export async function initReviewsMods() {
    appendDoctorPageAdditionalLinks();
    const filtersData = await getFiltersData();
    appendReviewsInfoToHeader(filtersData);
}

async function getFiltersData() {
    const filterChip = getFirstElement(SELECTORS.FILTER_CHIP);
    filterChip.click();

    const filterList = await waitForElement(document, SELECTORS.FILTER_LIST);
    const filtersData = new Map(
        [...getAllElements(SELECTORS.FILTER_LIST_ITEM, filterList)]
            .map((filter) => {
                const title = getFirstElement(SELECTORS.FILTER_TITLE_WRAP, filter)
                    .textContent
                    .trim();

                const countWrap = getFirstElement(SELECTORS.FILTER_COUNT_WRAP, filter);
                const count = getElementInnerNumber(countWrap, true);
                const { classList } = countWrap;

                return [filter, {
                    title,
                    count,
                    classList,
                }];
            }),
    );

    filterChip.click();

    return filtersData;
}

function appendReviewsInfoToHeader(filtersData) {
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

    filtersData.forEach((data, filter) => {
        const headerFilter = createSpan(
            { cursor: 'pointer' }, `${data.title} ${data.count}`,
        );
        headerFilter.classList = data.classList;
        headerFilter.addEventListener('click', () => {
            filter.click();
        });
        reviewsInfo.append(headerFilter);
    });

    nameSpan.append(reviewsInfoWrap);
}
