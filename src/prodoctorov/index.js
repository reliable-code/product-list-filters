import {
    appendFilterControlsIfNeeded,
    createMinReviewsFilterControl,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    hideElement,
    showElement,
} from '../common/dom';
import { getStorageValueOrDefault, setStorageValueFromEvent } from '../common/storage';

const MIN_REVIEWS_LOCAL_STORAGE_KEY = 'minReviewsFilter';

const APPOINTMENTS_PAGE = '.appointments_page';
const SPECIAL_PLACEMENT_CARD_SELECTOR = '.b-doctor-card_special-placement';

const DOCTOR_CARD_SELECTOR = '.b-doctor-card';
const DOCTOR_CARD_NAME_SELECTOR = '.b-doctor-card__name-surname';
const ADDITIONAL_LINKS_APPENDED_CLASS = 'additionalLinksAppended';

const MIN_REVIEWS = 10;

let minReviewsValue = getStorageValueOrDefault(MIN_REVIEWS_LOCAL_STORAGE_KEY, MIN_REVIEWS);

const appointmentsPage = getFirstElement(document, APPOINTMENTS_PAGE);

if (appointmentsPage) {
    setInterval(initListClean, 500);
} else {
    appendReviewsInfoToHeader();
}

function initListClean() {
    removeSpecialPlacementCards();

    appendFilterControlsIfNeeded(appointmentsPage, appendFiltersContainer);

    cleanList();
}

function appendFiltersContainer(filtersContainer, parentNode) {
    const minReviewsDiv = createMinReviewsFilterControl(minReviewsValue, updateMinReviewsValue);

    filtersContainer.append(minReviewsDiv);
    parentNode.prepend(filtersContainer);
}

function updateMinReviewsValue(e) {
    minReviewsValue = setStorageValueFromEvent(e, MIN_REVIEWS_LOCAL_STORAGE_KEY);
}

function removeSpecialPlacementCards() {
    const specialPlacementCards = getAllElements(document, SPECIAL_PLACEMENT_CARD_SELECTOR);

    specialPlacementCards.forEach(
        (specialPlacementCard) => specialPlacementCard.remove(),
    );
}

function cleanList() {
    const doctorCards = getAllElements(appointmentsPage, DOCTOR_CARD_SELECTOR);

    doctorCards.forEach(
        (doctorCard) => {
            const profileCard = getFirstElement(doctorCard, '.b-profile-card', true);

            const reviewsLink = getFirstElement(profileCard, ':scope > a');

            if (!reviewsLink) {
                doctorCard.remove();

                return;
            }

            const reviewsLinkNumber = getElementInnerNumber(reviewsLink, true);

            if (reviewsLinkNumber < minReviewsValue) {
                hideElement(doctorCard);
            } else {
                showElement(doctorCard, 'flex');
            }

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
    const doctorCardName = getFirstElement(doctorCard, DOCTOR_CARD_NAME_SELECTOR, true);
    const doctorName = doctorCardName.innerText;
    const searchString = `${doctorName} ${siteName}`;
    const encodedSearchString = encodeURIComponent(searchString);

    const lineBreak = document.createElement('br');

    const searchUrlLink = document.createElement('a');
    searchUrlLink.href = `https://www.google.com/search?q=${encodedSearchString}&btnI`;
    searchUrlLink.textContent = siteName;

    profileCard.append(lineBreak, searchUrlLink);
}

function appendReviewsInfoToHeader() {
    const reviewsFilter =
        getFirstElement(document, '.reviews-filter:not(.b-reviews-page__filter)');

    if (!reviewsFilter) return;

    const nameSpanHolder =
        getFirstElement(document, '.b-doctor-intro__title-first-line', true);

    if (!nameSpanHolder) return;

    const nameSpan = getFirstElement(nameSpanHolder, '[itemprop="name"]', true);

    if (!nameSpan) return;

    const reviewsInfo = document.createElement('div');
    reviewsInfo.classList.add('v-application');

    const reviewsFilterSpans = getAllElements(reviewsFilter, ':scope > span', true);

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
