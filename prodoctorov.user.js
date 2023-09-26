// ==UserScript==
// @name         Prodoctorov List Clean
// @namespace    https://github.com/reliable-code/product-list-filters
// @version      0.4.0
// @description  Remove product cards by filter
// @author       reliable-code
// @license      MIT
// @match        https://prodoctorov.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=prodoctorov.ru
// @grant        none
// ==/UserScript==

(function main() {
    const MIN_REVIEWS_LOCAL_STORAGE_KEY = 'minReviewsFilter';

    const APPOINTMENTS_PAGE = '.appointments_page';
    const SPECIAL_PLACEMENT_CARD_SELECTOR = '.b-doctor-card_special-placement';

    const MIN_REVIEWS_DIV_ID = 'minReviewsDiv';

    const DOCTOR_CARD_SELECTOR = '.b-doctor-card';
    const DOCTOR_CARD_NAME_SELECTOR = '.b-doctor-card__name-surname';

    const MIN_REVIEWS = 10;

    const minReviewsValue = +(localStorage.getItem(MIN_REVIEWS_LOCAL_STORAGE_KEY) ?? MIN_REVIEWS);

    const appointmentsPage = document.querySelector(APPOINTMENTS_PAGE);

    if (appointmentsPage) {
        initListClean();

        setInterval(checkListCleanInitiated, 500);
    }

    function checkListCleanInitiated() {
        const minReviewsDiv = appointmentsPage.querySelector(`#${MIN_REVIEWS_DIV_ID}`);

        if (!minReviewsDiv) {
            initListClean();
        }
    }

    function initListClean() {
        const minDivStyle = '';
        const minInputStyle = '';

        const minReviewsDiv = document.createElement('div');
        minReviewsDiv.id = MIN_REVIEWS_DIV_ID;
        minReviewsDiv.style = minDivStyle;
        const minReviewsDivText = document.createTextNode('Минимально отзывов: ');
        minReviewsDiv.appendChild(minReviewsDivText);

        const minReviewsInput = document.createElement('input');
        minReviewsInput.type = 'number';
        minReviewsInput.value = minReviewsValue;
        minReviewsInput.style = minInputStyle;
        minReviewsInput.addEventListener('change', updateMinReviewsInput);
        minReviewsDiv.appendChild(minReviewsInput);

        appointmentsPage.insertBefore(minReviewsDiv, appointmentsPage.firstChild);

        removeSpecialPlacementCards();

        cleanList();
    }

    function removeSpecialPlacementCards() {
        const specialPlacementCards = document.querySelectorAll(SPECIAL_PLACEMENT_CARD_SELECTOR);
        specialPlacementCards.forEach(
            (specialPlacementCard) => specialPlacementCard.remove(),
        );
    }

    function cleanList() {
        const doctorCards = appointmentsPage.querySelectorAll(DOCTOR_CARD_SELECTOR);

        doctorCards.forEach(
            (doctorCard) => {
                const profileCard = doctorCard.querySelector('.b-profile-card');

                if (!profileCard) return;

                const reviewsLink = profileCard.querySelector(':scope > a');

                if (!reviewsLink) {
                    doctorCard.remove();

                    return;
                }

                const reviewsLinkText = reviewsLink.innerText;
                const reviewsLinkDigit = +reviewsLinkText.replace(/\D/g, '');

                if (reviewsLinkDigit < minReviewsValue) {
                    doctorCard.remove();
                }

                appendAdditionalLinks(doctorCard, profileCard);
            },
        );
    }

    function appendAdditionalLinks(doctorCard, profileCard) {
        appendAdditionalLink(doctorCard, profileCard, 'НаПоправку');
        appendAdditionalLink(doctorCard, profileCard, 'DocDoc');
        appendAdditionalLink(doctorCard, profileCard, 'ДОКТУ');
    }

    function appendAdditionalLink(doctorCard, profileCard, siteName) {
        const doctorCardName = doctorCard.querySelector(DOCTOR_CARD_NAME_SELECTOR);
        const doctorName = doctorCardName.innerText;
        const searchString = `${doctorName} ${siteName}`;
        const encodedSearchString = encodeURIComponent(searchString);

        const lineBreak = document.createElement('br');
        profileCard.appendChild(lineBreak);

        const searchUrlLink = document.createElement('a');
        searchUrlLink.href = `http://www.google.com/search?q=${encodedSearchString}&btnI`;
        searchUrlLink.textContent = siteName;
        profileCard.appendChild(searchUrlLink);
    }

    function updateMinReviewsInput(e) {
        updateInput(MIN_REVIEWS_LOCAL_STORAGE_KEY, e);
    }

    function updateInput(keyName, e) {
        localStorage.setItem(keyName, e.target.value);
        window.location.reload();
    }
}());
