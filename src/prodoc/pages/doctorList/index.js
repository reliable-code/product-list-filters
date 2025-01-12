import { getURLPathElement } from '../../../common/url';
import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../../../common/dom/helpers';
import {
    applyStyles,
    hideElement,
    insertAfter,
    showElement,
    updateElementDisplay,
} from '../../../common/dom/manipulation';
import {
    isGreaterThanFilter,
    isLessThanFilter,
    isNotMatchTextFilter,
} from '../../../common/filter/compare';
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
import { SELECTORS } from './selectors';
import { createFilterFactory } from '../../../common/filter/factories/createFilter';
import { getStoredReviewsData, STORAGE_KEYS } from '../../db';
import { debounce } from '../../../common/dom/utils';
import { addStorageValueListener } from '../../../common/storage';
import { STYLES } from '../common/styles';

const SECTION_ID = getURLPathElement(2);

const {
    createGlobalFilter,
    createSectionFilter,
} = createFilterFactory(processDoctorCards, SECTION_ID);

const specFilter = createSectionFilter('spec-filter');
const clinicFilter = createSectionFilter('clinic-filter');
const minReviewsFilter = createSectionFilter('min-reviews-filter', 10);
const minExperienceFilter = createSectionFilter('min-experience-filter', 5, setExperienceQueryParam);
const maxExperienceFilter = createSectionFilter('max-experience-filter', 40);
const filterEnabled = createGlobalFilter('filter-enabled', true);

const state = {
    doctorCardsCache: new WeakMap(),
};

export function initDoctorListMods(appointmentsPage) {
    setExperienceQueryParam();

    removeListHeader();

    const doctorFilters = getFirstElement(SELECTORS.DOCTOR_FILTERS);
    appendFilterControlsIfNeeded(doctorFilters, appendFiltersContainer);

    processDoctorCards();

    addStorageValueListener(STORAGE_KEYS.LAST_DOCTOR_UPDATE, processDoctorCards);

    const observer = new MutationObserver(debounce(processDoctorCards));
    observer.observe(appointmentsPage, {
        childList: true,
    });
}

function removeListHeader() {
    const listHeader = getFirstElement(SELECTORS.LIST_HEADER);
    if (listHeader) listHeader.remove();
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);
    filtersContainer.style.marginTop = '6px';

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
    const maxExperienceDiv = createNumberFilterControl(
        'Макс. опыт: ',
        maxExperienceFilter,
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
        specFilterDiv,
        clinicFilterDiv,
        minReviewsDiv,
        minExperienceDiv,
        maxExperienceDiv,
        filterEnabledDiv,
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

        appendAdditionalLinks(getDoctorName(doctorCard), profileCard);

        cachedData = {
            specInfo,
            clinicName,
            reviewsLinkNumber,
            experienceNumber,
            reviewsLink,
            reviewInfoAppended: false,
        };

        state.doctorCardsCache.set(doctorCard, cachedData);
    }

    appendReviewInfoIfNeeded(cachedData);

    const shouldHide =
        isNotMatchTextFilter(cachedData.specInfo, specFilter) ||
        isNotMatchTextFilter(cachedData.clinicName, clinicFilter) ||
        isLessThanFilter(cachedData.reviewsLinkNumber, minReviewsFilter) ||
        isLessThanFilter(cachedData.experienceNumber, minExperienceFilter) ||
        isGreaterThanFilter(cachedData.experienceNumber, maxExperienceFilter);
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

function appendReviewInfoIfNeeded(cachedData) {
    if (cachedData.reviewInfoAppended) return;

    const { reviewsLink } = cachedData;
    const reviewsLinkHref = reviewsLink.href;
    const reviewsData = getStoredReviewsData(getDoctorIdFromHref(reviewsLinkHref));
    if (!reviewsData) return;

    const reviewsInfoBlock = createReviewsInfoBlock(reviewsData, reviewsLinkHref, true);
    insertAfter(reviewsLink, reviewsInfoBlock);
    cachedData.reviewInfoAppended = true;
}

function setExperienceQueryParam() {
    if (!minExperienceFilter.value) return;

    const url = new URL(window.location.href);
    const experienceQueryParam = url.searchParams.get('experience');
    if (+experienceQueryParam === minExperienceFilter.value) return;

    url.searchParams.set('experience', minExperienceFilter.value);
    window.location.href = url.toString();
}
