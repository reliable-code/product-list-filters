import { getAllElements, getFirstElement } from '../../../common/dom/helpers';
import { createDiv, createLink } from '../../../common/dom/factories/elements';
import { appendAdditionalLinks } from '../common';
import { SELECTORS } from './selectors';

export function initDoctorPageMods() {
    appendDoctorPageAdditionalLinks();
    // appendReviewsInfoToHeader();
    appendDoctorContactLink();
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

    if (reviewsFilterSpans.length < 2) return;

    reviewsFilterSpans.slice(1)
        .forEach((reviewsFilterSpan) => {
            const reviewsFilterSpanCopy = reviewsFilterSpan.cloneNode(true);
            reviewsFilterSpanCopy.addEventListener('click', () => {
                reviewsFilterSpan.parentNode.scrollIntoView({ behavior: 'smooth' });
                reviewsFilterSpan.click();
            });
            reviewsInfo.append(reviewsFilterSpanCopy);
        });

    nameSpan.append(reviewsInfoWrap);
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
