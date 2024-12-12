import { getURLPathElement } from '../../../common/url';
import {
    applyStyles,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../../../common/dom/helpers';
import { hideElement, showElement, updateElementDisplay } from '../../../common/dom/manipulation';
import { isLessThanFilter, isNotMatchTextFilter } from '../../../common/filter/compare';
import { appendAdditionalLinks } from '../common/common';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import { StoredInputValue } from '../../../common/storage/storage';
import {
    createNumberFilterControl,
    createTextFilterControl,
} from '../../../common/filter/factories/genericControls';
import {
    createEnabledFilterControl,
    createMinReviewsFilterControl,
} from '../../../common/filter/factories/specificControls';

const DOCTOR_CARD_SELECTOR = '.b-doctor-card';
const DOCTOR_CARD_NAME_SELECTOR = '.b-doctor-card__name-surname';
const SECTION_ID = getURLPathElement(2);

function createGlobalFilter(filterName, defaultValue = null, onChange = processDoctorCards) {
    return StoredInputValue.create(filterName, defaultValue, onChange);
}

function createSectionFilter(filterName, defaultValue = null, onChange = processDoctorCards) {
    return StoredInputValue.createWithCompositeKey(
        SECTION_ID, filterName, defaultValue, onChange,
    );
}

const specFilter = createSectionFilter('spec-filter');
const clinicFilter = createSectionFilter('clinic-filter');
const minReviewsFilter = createSectionFilter('min-reviews-filter', 10);
const minExperienceFilter = createSectionFilter('min-experience-filter', 5);
const filterEnabled = createGlobalFilter('filter-enabled', true);

export function initDoctorListMods(appointmentsPage) {
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
    const doctorCards = getAllElements(DOCTOR_CARD_SELECTOR);

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
