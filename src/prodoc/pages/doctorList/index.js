import { getURLPathElement } from '../../../common/url';
import {
    applyStyles,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../../../common/dom/helpers';
import { hideElement, showElement, updateElementDisplay } from '../../../common/dom/manipulation';
import { isLessThanFilter, isNotMatchTextFilter } from '../../../common/filter/compare';
import { appendAdditionalLinks, createReviewsInfoBlock, getDoctorIdFromHref } from '../common';
import { appendFilterControlsIfNeeded } from '../../../common/filter/manager';
import {
    createNumberFilterControl,
    createTextFilterControl,
} from '../../../common/filter/factories/genericControls';
import {
    createEnabledFilterControl,
    createMinReviewsFilterControl,
} from '../../../common/filter/factories/specificControls';
import { STYLES } from './styles';
import { SELECTORS } from './selectors';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';
import { getStoredReviewsData } from '../../db';

const SECTION_ID = getURLPathElement(2);

const {
    createGlobalFilter,
    createSectionFilter,
} = createFilterFactory(processDoctorCards, SECTION_ID);

const specFilter = createSectionFilter('spec-filter');
const clinicFilter = createSectionFilter('clinic-filter');
const minReviewsFilter = createSectionFilter('min-reviews-filter', 10);
const minExperienceFilter = createSectionFilter('min-experience-filter', 5);
const filterEnabled = createGlobalFilter('filter-enabled', true);

const state = {
    doctorCardsCache: new WeakMap(),
};

export function initDoctorListMods(appointmentsPage) {
    const doctorFilters = getFirstElement(SELECTORS.DOCTOR_FILTERS);
    appendFilterControlsIfNeeded(doctorFilters, appendFiltersContainer);

    processDoctorCards();
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);

    const specFilterDiv = createTextFilterControl(
        'Специализация:', specFilter, STYLES.CONTROL, STYLES.TEXT_INPUT,
    );
    const clinicFilterDiv = createTextFilterControl(
        'Клиника:', clinicFilter, STYLES.CONTROL, STYLES.TEXT_INPUT,
    );
    const minReviewsDiv = createMinReviewsFilterControl(
        minReviewsFilter, STYLES.CONTROL, STYLES.NUMBER_INPUT,
    );
    const minExperienceDiv = createNumberFilterControl(
        'Мин. опыт: ',
        minExperienceFilter,
        '1',
        '0',
        '100',
        STYLES.CONTROL,
        STYLES.NUMBER_INPUT,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );

    filtersContainer.append(
        specFilterDiv, clinicFilterDiv, minReviewsDiv, minExperienceDiv, filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
}

function processDoctorCards() {
    const doctorCards = getAllElements(SELECTORS.DOCTOR_CARD);

    doctorCards.forEach(processDoctorCard);
}

function processDoctorCard(doctorCard) {
    if (!filterEnabled.value) {
        showElement(doctorCard);
        return;
    }

    let cachedData = state.doctorCardsCache.get(doctorCard);

    if (!cachedData) {
        const profileCard = getFirstElement(SELECTORS.PROFILE_CARD, doctorCard);
        const reviewsLink = getFirstElement(SELECTORS.REVIEWS_LINK, profileCard);
        const experienceWrap = getFirstElement(SELECTORS.EXPERIENCE_WRAP, doctorCard);

        if (!reviewsLink || !experienceWrap) {
            hideElement(doctorCard);
            return;
        }

        const specWrap = getFirstElement(
            SELECTORS.SPEC_WRAP, doctorCard, true,
        );
        const specInfo = specWrap.innerText.trim();

        const clinicContainer = getFirstElement(
            SELECTORS.CLINIC_CONTAINER, doctorCard, true,
        );
        const clinicWrap = getFirstElement(
            SELECTORS.CLINIC_WRAP, clinicContainer, true,
        );
        const clinicName = clinicWrap.innerText.trim();

        const reviewsLinkNumber = getElementInnerNumber(reviewsLink, true);

        const experienceNumber = getElementInnerNumber(experienceWrap, true);

        const newReviewsLinkHref = getNewReviewsLinkHref(reviewsLink);
        reviewsLink.href = newReviewsLinkHref;

        const reviewsData = getStoredReviewsData(getDoctorIdFromHref(newReviewsLinkHref));
        if (reviewsData) {
            const reviewsInfoBlock = createReviewsInfoBlock(
                reviewsData, newReviewsLinkHref, true,
            );
            profileCard.append(reviewsInfoBlock);
        }

        appendAdditionalLinks(getDoctorName(doctorCard), profileCard);

        cachedData = {
            specInfo,
            clinicName,
            reviewsLinkNumber,
            experienceNumber,
        };

        state.doctorCardsCache.set(doctorCard, cachedData);
    }

    const shouldHide =
        isNotMatchTextFilter(cachedData.specInfo, specFilter) ||
        isNotMatchTextFilter(cachedData.clinicName, clinicFilter) ||
        isLessThanFilter(cachedData.reviewsLinkNumber, minReviewsFilter) ||
        isLessThanFilter(cachedData.experienceNumber, minExperienceFilter);
    updateElementDisplay(doctorCard, shouldHide);
}

function getNewReviewsLinkHref(reviewsLink) {
    return reviewsLink.href.replace(
        /\/#otzivi$/, '/otzivi/',
    );
}

function getDoctorName(doctorCard) {
    const doctorCardName = getFirstElement(SELECTORS.DOCTOR_CARD_NAME, doctorCard, true);
    return doctorCardName.innerText;
}
