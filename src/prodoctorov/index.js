import {
    createDefaultFilterControl,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    updateInput,
} from '../common/dom';

const MIN_REVIEWS_LOCAL_STORAGE_KEY = 'minReviewsFilter';

const APPOINTMENTS_PAGE = '.appointments_page';
const SPECIAL_PLACEMENT_CARD_SELECTOR = '.b-doctor-card_special-placement';

const MIN_REVIEWS_DIV_ID = 'minReviewsDiv';

const DOCTOR_CARD_SELECTOR = '.b-doctor-card';
const DOCTOR_CARD_NAME_SELECTOR = '.b-doctor-card__name-surname';

const MIN_REVIEWS = 10;

const minReviewsValue = +(localStorage.getItem(MIN_REVIEWS_LOCAL_STORAGE_KEY) ?? MIN_REVIEWS);

const appointmentsPage = getFirstElement(document, APPOINTMENTS_PAGE);

if (appointmentsPage) {
    initListClean();

    setInterval(checkListCleanInitiated, 500);
}

function initListClean() {
    const minReviewsDiv =
        createDefaultFilterControl('Минимально отзывов: ',
            minReviewsValue,
            '1',
            '1',
            '999999',
            updateMinReviewsInput);

    minReviewsDiv.id = MIN_REVIEWS_DIV_ID;

    appointmentsPage.prepend(minReviewsDiv);

    removeSpecialPlacementCards();

    cleanList();
}

function updateMinReviewsInput(e) {
    updateInput(MIN_REVIEWS_LOCAL_STORAGE_KEY, e);
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
                doctorCard.remove();
            }

            appendAdditionalLinks(doctorCard, profileCard);
        },
    );
}

function appendAdditionalLinks(doctorCard, profileCard) {
    appendAdditionalLink(doctorCard, profileCard, 'НаПоправку');
    appendAdditionalLink(doctorCard, profileCard, 'DocDoc');
    appendAdditionalLink(doctorCard, profileCard, 'Докту');
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

function checkListCleanInitiated() {
    const minReviewsDiv = getFirstElement(appointmentsPage, `#${MIN_REVIEWS_DIV_ID}`);

    if (!minReviewsDiv) {
        initListClean();
    }
}
