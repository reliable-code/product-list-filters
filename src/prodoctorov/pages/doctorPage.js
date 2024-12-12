import { getAllElements, getFirstElement } from '../../common/dom/helpers';
import { createDiv, createLink } from '../../common/dom/factories/elements';
import { appendAdditionalLinks } from './common/common';

const DOCTOR_DETAILS_MENU_SELECTOR = '.b-doctor-details__toc';

export function initDoctorPageMods() {
    appendDoctorPageAdditionalLinks();
    appendReviewsInfoToHeader();
    appendDoctorContactLink();
    clickMoreReviewsButtonWhileExists();
}

function appendDoctorPageAdditionalLinks() {
    const doctorCardName = getFirstElement('.b-doctor-intro__title-first-line [itemprop="name"]', document, true);
    if (doctorCardName) {
        const doctorName = doctorCardName.innerText.trim();
        const linksContainer = createDiv();
        linksContainer.style.textAlign = 'center';
        const doctorIntroLeft = getFirstElement('.b-doctor-intro__left-side');
        doctorIntroLeft.append(linksContainer);

        appendAdditionalLinks(doctorName, linksContainer);
    }
}

function appendReviewsInfoToHeader() {
    const reviewsFilter =
        getFirstElement('.reviews-filter:not(.b-reviews-page__filter)');

    if (!reviewsFilter) return;

    const nameSpanHolder =
        getFirstElement('.b-doctor-intro__title-first-line', document, true);

    if (!nameSpanHolder) return;

    const nameSpan = getFirstElement('[itemprop="name"]', nameSpanHolder, true);

    if (!nameSpan) return;

    const reviewsInfo = createDiv();
    reviewsInfo.style.position = 'absolute';
    reviewsInfo.classList.add('v-application');
    const reviewsInfoWrap = createDiv();
    reviewsInfoWrap.style.position = 'relative';
    reviewsInfoWrap.style.height = '45px';
    reviewsInfoWrap.append(reviewsInfo);

    const reviewsFilterSpans = getAllElements(':scope > span', reviewsFilter, true);

    const lastReviewsFilterSpansIndex = reviewsFilterSpans.length - 1;

    for (let i = 1; i <= lastReviewsFilterSpansIndex; i += 1) {
        const reviewsFilterSpan = reviewsFilterSpans[i];
        const reviewsFilterSpanCopy = reviewsFilterSpan.cloneNode(true);
        reviewsFilterSpanCopy.addEventListener('click', scrollToParentAndClick(reviewsFilterSpan));
        reviewsInfo.append(reviewsFilterSpanCopy);
    }

    nameSpan.append(reviewsInfoWrap);
}

function scrollToParentAndClick(element) {
    return () => {
        element.parentNode.scrollIntoView({ behavior: 'smooth' });
        element.click();
    };
}

function appendDoctorContactLink() {
    const doctorContacts = getFirstElement('#doctor-contacts');

    if (!doctorContacts) return;

    const doctorDetailsMenu = [...getAllElements(DOCTOR_DETAILS_MENU_SELECTOR)].pop();

    if (!doctorDetailsMenu) return;

    doctorDetailsMenu.style.position = 'sticky';
    doctorDetailsMenu.style.top = '16px';

    const doctorContactsLinkTitle = createDiv({}, 'Место работы');
    doctorContactsLinkTitle.classList.add('b-doctor-details__toc-title');
    const doctorContactsLink = createLink({}, null, '#doctor-contacts');
    doctorContactsLink.append(doctorContactsLinkTitle);
    doctorContactsLink.classList.add('b-doctor-details__toc-item');

    doctorDetailsMenu.insertBefore(doctorContactsLink, doctorDetailsMenu.firstChild);
}

function clickMoreReviewsButtonWhileExists() {
    const moreReviewsButton = getFirstElement('[data-qa="show_more_list_items"]');

    if (moreReviewsButton && !moreReviewsButton.classList.contains('d-none')) {
        moreReviewsButton.click();
    }

    setTimeout(clickMoreReviewsButtonWhileExists, 250);
}
