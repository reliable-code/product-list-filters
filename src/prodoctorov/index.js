import { StoredInputValue } from '../common/storage/localstorage';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { getURLPathElement } from '../common/url';
import { createDiv, createLink } from '../common/dom/elementsFactory';
import { isLessThanFilter, isNotMatchTextFilter } from '../common/filter/compare';
import {
    createEnabledFilterControl,
    createFilterControlNumber,
    createFilterControlText,
    createMinReviewsFilterControl,
} from '../common/filter/controlsFactory';
import { hideElement, showElement, showHideElement } from '../common/dom/manipulation';
import { getAllElements, getElementInnerNumber, getFirstElement } from '../common/dom/helpers';

const APPOINTMENTS_PAGE = '.appointments_page';
const SPECIAL_PLACEMENT_CARD_SELECTOR = '.b-doctor-card_special-placement';

const DOCTOR_CARD_SELECTOR = '.b-doctor-card';
const DOCTOR_CARD_NAME_SELECTOR = '.b-doctor-card__name-surname';
const ADDITIONAL_LINKS_APPENDED_CLASS = 'additionalLinksAppended';

const DOCTOR_DETAILS_MAIN_SELECTOR = '.b-doctor-details__main';
const DOCTOR_DETAILS_MENU_SELECTOR = '.b-doctor-details__toc';

const CATEGORY_NAME = getURLPathElement(2);

const specFilter = new StoredInputValue(`${CATEGORY_NAME}-spec-filter`, null);
const clinicFilter = new StoredInputValue(`${CATEGORY_NAME}-clinic-filter`, null);
const minReviewsFilter = new StoredInputValue('min-reviews-filter', 10);
const minExperienceFilter = new StoredInputValue('min-experience-filter', 5);
const filterEnabled = new StoredInputValue('filter-enabled', true);

const appointmentsPage = getFirstElement(APPOINTMENTS_PAGE);

if (appointmentsPage) {
    setInterval(initListClean, 100);
} else {
    appendDoctorPageAdditionalLinks();
    appendReviewsInfoToHeader();
    appendDoctorContactLink();
    clickMoreReviewsButtonWhileExists();
}

function initListClean() {
    // removeSpecialPlacementCards();

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
    const textInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 180px;';
    const numberInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 45px;';
    const checkboxInputStyle =
        inputStyle + // eslint-disable-line prefer-template
        'width: 20px;' +
        'height: 20px;';

    const specFilterDiv =
        createFilterControlText('Специализация:', specFilter, controlStyle, textInputStyle);

    const clinicFilterDiv =
        createFilterControlText('Клиника:', clinicFilter, controlStyle, textInputStyle);

    const minReviewsDiv =
        createMinReviewsFilterControl(minReviewsFilter, controlStyle, numberInputStyle);

    const minExperienceDiv =
        createFilterControlNumber(
            'Мин. опыт: ',
            minExperienceFilter,
            '1',
            '0',
            '100',
            controlStyle,
            numberInputStyle,
        );

    const filterEnabledDiv =
        createEnabledFilterControl(filterEnabled, controlStyle, checkboxInputStyle);

    filtersContainer.append(
        specFilterDiv, clinicFilterDiv, minReviewsDiv, minExperienceDiv, filterEnabledDiv,
    );

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
                showElement(doctorCard);

                return;
            }

            const profileCard =
                getFirstElement('.b-profile-card', doctorCard, true);

            const reviewsLink =
                getFirstElement(':scope > a', profileCard);

            const experienceWrap =
                getFirstElement('.b-doctor-card__experience .mr-2 .ui-text', doctorCard, true);

            if (!reviewsLink || !experienceWrap) {
                hideElement(doctorCard);

                return;
            }

            const specWrap =
                getFirstElement('.b-doctor-card__spec', doctorCard, true);

            const specInfo = specWrap.innerText.trim();

            const clinicContainer =
                getFirstElement('div.b-doctor-card__lpu-select', doctorCard, true);

            const clinicWrap =
                getFirstElement('.b-select__trigger-main-text', clinicContainer, true);

            const clinicName = clinicWrap.innerText.trim();

            const reviewsLinkNumber = getElementInnerNumber(reviewsLink, true);

            const experienceNumber = getElementInnerNumber(experienceWrap, true);

            const conditionToHide =
                isNotMatchTextFilter(specInfo, specFilter) ||
                isNotMatchTextFilter(clinicName, clinicFilter) ||
                isLessThanFilter(reviewsLinkNumber, minReviewsFilter) ||
                isLessThanFilter(experienceNumber, minExperienceFilter);
            showHideElement(doctorCard, conditionToHide);

            const doctorCardName = getFirstElement(DOCTOR_CARD_NAME_SELECTOR, doctorCard, true);
            const doctorName = doctorCardName.innerText;

            appendAdditionalLinks(doctorName, profileCard);
        },
    );
}

function appendAdditionalLinks(doctorName, linksContainer) {
    if (linksContainer.classList.contains(ADDITIONAL_LINKS_APPENDED_CLASS)) {
        return;
    }

    appendAdditionalLink(doctorName, linksContainer, 'НаПоправку');
    appendAdditionalLink(doctorName, linksContainer, 'DocDoc');
    appendAdditionalLink(doctorName, linksContainer, 'Докту');

    linksContainer.classList.add(ADDITIONAL_LINKS_APPENDED_CLASS);
}

function appendAdditionalLink(doctorName, linksContainer, siteName) {
    const searchString = `${doctorName} ${siteName}`;
    const encodedSearchString = encodeURIComponent(searchString);

    const lineBreak = document.createElement('br');

    const href = `https://www.google.com/search?q=${encodedSearchString}&btnI`;
    const searchUrlLink = createLink({}, siteName, href);

    linksContainer.append(lineBreak, searchUrlLink);
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
