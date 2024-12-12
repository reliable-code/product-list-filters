import { getAllElements, getFirstElement } from '../../common/dom/helpers';
import { createDiv, createLink } from '../../common/dom/factories/elements';
import { appendAdditionalLinks } from './common/common';

const SELECTORS = {
    DOCTOR_DETAILS: '.b-doctor-details__toc',
    DOCTOR_CARD_NAME: '.b-doctor-intro__title-first-line [itemprop="name"]',
    DOCTOR_INTRO_LEFT: '.b-doctor-intro__left-side',
    REVIEWS_FILTER: '.reviews-filter:not(.b-reviews-page__filter)',
    NAME_SPAN_HOLDER: '.b-doctor-intro__title-first-line',
    NAME_SPAN: '[itemprop="name"]',
    REVIEWS_FILTER_SPAN: ':scope > span',
    DOCTOR_CONTACTS: '#doctor-contacts',
    MORE_REVIEWS_BUTTON: '[data-qa="show_more_list_items"]',
};

export function initDoctorPageMods() {
    appendDoctorPageAdditionalLinks();
    appendReviewsInfoToHeader();
    appendDoctorContactLink();
    clickMoreReviewsButtonWhileExists();
}

function appendDoctorPageAdditionalLinks() {
    const doctorCardName = getFirstElement(SELECTORS.DOCTOR_CARD_NAME, document, true);
    if (!doctorCardName) return;

    const doctorName = doctorCardName.innerText.trim();
    const linksContainer = createDiv();
    linksContainer.style.textAlign = 'center';
    const doctorIntroLeft = getFirstElement(SELECTORS.DOCTOR_INTRO_LEFT);
    doctorIntroLeft.append(linksContainer);
    appendAdditionalLinks(doctorName, linksContainer);
}

function appendReviewsInfoToHeader() {
    const reviewsFilter = getFirstElement(SELECTORS.REVIEWS_FILTER);
    if (!reviewsFilter) return;

    const nameSpanHolder = getFirstElement(SELECTORS.NAME_SPAN_HOLDER, document, true);
    if (!nameSpanHolder) return;

    const nameSpan = getFirstElement(SELECTORS.NAME_SPAN, nameSpanHolder, true);
    if (!nameSpan) return;

    const reviewsInfo = createDiv();
    reviewsInfo.style.position = 'absolute';
    reviewsInfo.classList.add('v-application');

    const reviewsInfoWrap = createDiv();
    reviewsInfoWrap.style.position = 'relative';
    reviewsInfoWrap.style.height = '45px';

    reviewsInfoWrap.append(reviewsInfo);

    const reviewsFilterSpans = getAllElements(
        SELECTORS.REVIEWS_FILTER_SPAN, reviewsFilter, true,
    );

    reviewsFilterSpans.slice(1)
        .forEach((reviewsFilterSpan) => {
            const reviewsFilterSpanCopy = reviewsFilterSpan.cloneNode(true);
            reviewsFilterSpanCopy.addEventListener('click', scrollToParentAndClick(reviewsFilterSpan));
            reviewsInfo.append(reviewsFilterSpanCopy);
        });

    nameSpan.append(reviewsInfoWrap);
}

function scrollToParentAndClick(element) {
    return () => {
        element.parentNode.scrollIntoView({ behavior: 'smooth' });
        element.click();
    };
}

function appendDoctorContactLink() {
    const doctorContacts = getFirstElement(SELECTORS.DOCTOR_CONTACTS);
    if (!doctorContacts) return;

    const doctorDetailsMenu = [...getAllElements(SELECTORS.DOCTOR_DETAILS)].pop();
    if (!doctorDetailsMenu) return;

    doctorDetailsMenu.style.position = 'sticky';
    doctorDetailsMenu.style.top = '16px';

    const doctorContactsLinkTitle = createDiv({}, 'Место работы');
    doctorContactsLinkTitle.classList.add('b-doctor-details__toc-title');

    const doctorContactsLink = createLink({}, null, '#doctor-contacts');
    doctorContactsLink.classList.add('b-doctor-details__toc-item');

    doctorContactsLink.append(doctorContactsLinkTitle);

    doctorDetailsMenu.insertBefore(doctorContactsLink, doctorDetailsMenu.firstChild);
}

function clickMoreReviewsButtonWhileExists() {
    const moreReviewsButton = getFirstElement(SELECTORS.MORE_REVIEWS_BUTTON);

    if (moreReviewsButton && !moreReviewsButton.classList.contains('d-none')) {
        moreReviewsButton.click();
    }

    setTimeout(clickMoreReviewsButtonWhileExists, 250);
}
