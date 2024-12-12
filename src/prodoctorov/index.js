import { StoredInputValue } from '../common/storage/localstorage';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';
import { getURLPathElement } from '../common/url';
import { isLessThanFilter, isNotMatchTextFilter } from '../common/filter/compare';
import {
    createNumberFilterControl,
    createTextFilterControl,
} from '../common/filter/factories/genericControls';
import { hideElement, showElement, updateElementDisplay } from '../common/dom/manipulation';
import {
    applyStyles,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../common/dom/helpers';
import {
    createEnabledFilterControl,
    createMinReviewsFilterControl,
} from '../common/filter/factories/specificControls';
import { appendAdditionalLinks } from './pages/common/common';
import { initDoctorPageMods } from './pages/doctorPage';

const APPOINTMENTS_PAGE = '.appointments_page';

const DOCTOR_CARD_SELECTOR = '.b-doctor-card';
const DOCTOR_CARD_NAME_SELECTOR = '.b-doctor-card__name-surname';

const DOCTOR_DETAILS_MAIN_SELECTOR = '.b-doctor-details__main';

const CATEGORY_NAME = getURLPathElement(2);

const specFilter = new StoredInputValue(`${CATEGORY_NAME}-spec-filter`, null);
const clinicFilter = new StoredInputValue(`${CATEGORY_NAME}-clinic-filter`, null);
const minReviewsFilter = new StoredInputValue('min-reviews-filter', 10);
const minExperienceFilter = new StoredInputValue('min-experience-filter', 5);
const filterEnabled = new StoredInputValue('filter-enabled', true);

const appointmentsPage = getFirstElement(APPOINTMENTS_PAGE);

if (appointmentsPage) {
    initDoctorListMods();
} else {
    initDoctorPageMods();
}

function initDoctorListMods() {
    setInterval(initProcessDoctorCards, 100);
}

function initProcessDoctorCards() {
    appendFilterControlsIfNeeded(appointmentsPage, appendFiltersContainer);

    processDoctorCards();
}

function appendFiltersContainer(filtersContainer, parentNode) {
    const filtersContainerStyle = {
        display: 'flex',
        gridGap: '15px',
        marginTop: '5px',
        fontSize: '15px',
    };
    applyStyles(filtersContainer, filtersContainerStyle);

    const controlStyle = {
        display: 'flex',
        alignItems: 'center',
    };
    const inputStyle = {
        margin: '0px 4px',
    };
    const textInputStyle = {
        ...inputStyle,
        width: '180px',
    };
    const numberInputStyle = {
        ...inputStyle,
        width: '45px',
    };
    const checkboxInputStyle = {
        ...inputStyle,
        width: '20px',
        height: '20px',
    };

    const specFilterDiv = createTextFilterControl(
        'Специализация:', specFilter, controlStyle, textInputStyle,
    );
    const clinicFilterDiv = createTextFilterControl(
        'Клиника:', clinicFilter, controlStyle, textInputStyle,
    );
    const minReviewsDiv = createMinReviewsFilterControl(
        minReviewsFilter, controlStyle, numberInputStyle,
    );
    const minExperienceDiv = createNumberFilterControl(
        'Мин. опыт: ',
        minExperienceFilter,
        '1',
        '0',
        '100',
        controlStyle,
        numberInputStyle,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, controlStyle, checkboxInputStyle,
    );

    filtersContainer.append(
        specFilterDiv, clinicFilterDiv, minReviewsDiv, minExperienceDiv, filterEnabledDiv,
    );

    parentNode.prepend(filtersContainer);
}

function processDoctorCards() {
    const doctorCards = getAllElements(DOCTOR_CARD_SELECTOR, appointmentsPage);

    doctorCards.forEach(processDoctorCard);
}

function processDoctorCard(doctorCard) {
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

    const specWrap = getFirstElement('.b-doctor-card__spec', doctorCard, true);

    const specInfo = specWrap.innerText.trim();

    const clinicContainer =
        getFirstElement('div.b-doctor-card__lpu-select', doctorCard, true);

    const clinicWrap =
        getFirstElement('.b-select__trigger-main-text', clinicContainer, true);

    const clinicName = clinicWrap.innerText.trim();

    const reviewsLinkNumber = getElementInnerNumber(reviewsLink, true);

    const experienceNumber = getElementInnerNumber(experienceWrap, true);

    const shouldHide =
        isNotMatchTextFilter(specInfo, specFilter) ||
        isNotMatchTextFilter(clinicName, clinicFilter) ||
        isLessThanFilter(reviewsLinkNumber, minReviewsFilter) ||
        isLessThanFilter(experienceNumber, minExperienceFilter);
    updateElementDisplay(doctorCard, shouldHide);

    const doctorCardName = getFirstElement(DOCTOR_CARD_NAME_SELECTOR, doctorCard, true);
    const doctorName = doctorCardName.innerText;

    appendAdditionalLinks(doctorName, profileCard);
}
