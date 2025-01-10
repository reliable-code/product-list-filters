import { getAllElements, getFirstElement } from '../../../common/dom/helpers';
import { createDiv, createLink } from '../../../common/dom/factories/elements';
import {
    appendDoctorPageAdditionalLinks,
    appendReviewsInfoBlockToHeader,
    createReviewsInfoBlock,
    getDoctorIdFromPathname,
} from '../common';
import { SELECTORS } from './selectors';
import { getStoredReviewsData } from '../../db';

export function initDoctorPageMods() {
    appendDoctorPageAdditionalLinks();
    appendDoctorContactLink();

    const reviewsData = getStoredReviewsData(getDoctorIdFromPathname());
    if (!reviewsData) return;
    const reviewsInfoBlock = createReviewsInfoBlock(reviewsData, getBaseReviewsUrl());
    appendReviewsInfoBlockToHeader(reviewsInfoBlock);
}

function getBaseReviewsUrl() {
    const { location } = window;
    return `${location.origin}${location.pathname}otzivi/`;
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
