import {
    createDiv,
    createLink,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    hideElement,
    showElement,
    showHideElement,
} from '../common/dom';
import { StorageValue } from '../common/storage';
import {
    appendFilterControlsIfNeeded,
    createEnabledFilterControl,
    createMinReviewsFilterControl,
} from '../common/filter';

const APPOINTMENTS_PAGE = '.appointments_page';
const SPECIAL_PLACEMENT_CARD_SELECTOR = '.b-doctor-card_special-placement';

const DOCTOR_CARD_SELECTOR = '.b-doctor-card';
const DOCTOR_CARD_NAME_SELECTOR = '.b-doctor-card__name-surname';
const ADDITIONAL_LINKS_APPENDED_CLASS = 'additionalLinksAppended';

const DOCTOR_DETAILS_MAIN_SELECTOR = '.b-doctor-details__main';
const DOCTOR_DETAILS_MENU_SELECTOR = '.b-doctor-details__toc';

const minReviewsFilter = new StorageValue('min-reviews-filter', 10);
const filterEnabled = new StorageValue('filter-enabled', true);

const appointmentsPage = getFirstElement(APPOINTMENTS_PAGE);

if (appointmentsPage) {
    setInterval(initListClean, 100);
} else {
    appendReviewsInfoToHeader();
    appendDoctorContactLink();
}

function initListClean() {
    removeSpecialPlacementCards();

    appendFilterControlsIfNeeded(appointmentsPage, appendFiltersContainer);

    cleanList();
}

function appendFiltersContainer(filtersContainer, parentNode) {
    filtersContainer.style =
        'display: flex;' +
        'grid-gap: 15px;' +
        'margin-top: 5px;' +
        'font-size: 15px;';

    const controlStyle =
        'display: flex;' +
        'align-items: center;';

    const inputStyle =
        'margin: 0px 4px;';
    const numberInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 45px;';
    const checkboxInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 20px;' +
        'height: 20px;';

    const minReviewsDiv =
        createMinReviewsFilterControl(minReviewsFilter, controlStyle, numberInputStyle);

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    filtersContainer.append(minReviewsDiv, filterEnabledDiv);
    parentNode.prepend(filtersContainer);
}

function removeSpecialPlacementCards() {
    const specialPlacementCards = getAllElements(SPECIAL_PLACEMENT_CARD_SELECTOR);

    specialPlacementCards.forEach(
        (specialPlacementCard) => specialPlacementCard.remove(),
    );
}

function cleanList() {
    const doctorCards = getAllElements(DOCTOR_CARD_SELECTOR, appointmentsPage);

    doctorCards.forEach(
        (doctorCard) => {
            if (!filterEnabled.value) {
                showElement(doctorCard, 'flex');

                return;
            }

            const profileCard = getFirstElement('.b-profile-card', doctorCard, true);

            const reviewsLink = getFirstElement(':scope > a', profileCard);

            if (!reviewsLink) {
                hideElement(doctorCard);

                return;
            }

            const reviewsLinkNumber = getElementInnerNumber(reviewsLink, true);

            showHideElement(
                doctorCard, reviewsLinkNumber < minReviewsFilter.value, 'flex',
            );

            appendAdditionalLinks(doctorCard, profileCard);
        },
    );
}

function appendAdditionalLinks(doctorCard, profileCard) {
    if (profileCard.classList.contains(ADDITIONAL_LINKS_APPENDED_CLASS)) {
        return;
    }

    appendAdditionalLink(doctorCard, profileCard, 'НаПоправку');
    appendAdditionalLink(doctorCard, profileCard, 'DocDoc');
    appendAdditionalLink(doctorCard, profileCard, 'Докту');

    profileCard.classList.add(ADDITIONAL_LINKS_APPENDED_CLASS);
}

function appendAdditionalLink(doctorCard, profileCard, siteName) {
    const doctorCardName = getFirstElement(DOCTOR_CARD_NAME_SELECTOR, doctorCard, true);
    const doctorName = doctorCardName.innerText;
    const searchString = `${doctorName} ${siteName}`;
    const encodedSearchString = encodeURIComponent(searchString);

    const lineBreak = document.createElement('br');

    const searchUrlLink =
        createLink(`https://www.google.com/search?q=${encodedSearchString}&btnI`, siteName);

    profileCard.append(lineBreak, searchUrlLink);
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
    reviewsInfo.classList.add('v-application');

    const reviewsFilterSpans = getAllElements(':scope > span', reviewsFilter, true);

    const lastReviewsFilterSpansIndex = reviewsFilterSpans.length - 1;

    for (let i = 1; i <= lastReviewsFilterSpansIndex; i += 1) {
        const reviewsFilterSpan = reviewsFilterSpans[i];
        const reviewsFilterSpanCopy = reviewsFilterSpan.cloneNode(true);
        reviewsFilterSpanCopy.addEventListener('click', scrollToParentAndClick(reviewsFilterSpan));
        reviewsInfo.append(reviewsFilterSpanCopy);
    }

    nameSpan.append(reviewsInfo);
}

function scrollToParentAndClick(element) {
    return () => {
        element.parentNode.scrollIntoView({ behavior: 'smooth' });
        element.click();
    };
}

function appendDoctorContactLink() {
    const doctorDetailsMain = getFirstElement(DOCTOR_DETAILS_MAIN_SELECTOR);

    if (!doctorDetailsMain) return;

    const doctorContacts = getFirstElement('.b-doctor-contacts');

    if (!doctorContacts) return;

    const doctorContactsTitle = getFirstElement('.b-doctor-contacts__title', doctorContacts);
    doctorContactsTitle.remove();

    const doctorContactsBody = getFirstElement('.b-doctor-contacts__body', doctorContacts);
    doctorContactsBody.style.margin = 0;

    const doctorContactsCopyWrap = createDiv();
    doctorContactsCopyWrap.classList.add(
        'b-doctor-details__item', 'b-box', 'b-box_shadow',
    );

    doctorContactsCopyWrap.append(doctorContacts);
    doctorDetailsMain.prepend(doctorContactsCopyWrap);

    const doctorDetailsMenu = getFirstElement(DOCTOR_DETAILS_MENU_SELECTOR);

    if (!doctorDetailsMenu) return;

    doctorDetailsMenu.style.position = 'sticky';
    doctorDetailsMenu.style.top = '16px';

    const doctorContactsLinkTitle = createDiv('Место работы');
    doctorContactsLinkTitle.classList.add('b-doctor-details__toc-title');
    const doctorContactsLink = createLink('#doctor-contacts');
    doctorContactsLink.append(doctorContactsLinkTitle);
    doctorContactsLink.classList.add('b-doctor-details__toc-item');

    doctorDetailsMenu.insertBefore(doctorContactsLink, doctorDetailsMenu.firstChild);
}
