import { createDiv, createLink } from '../../../common/dom/factories/elements';
import { getFirstElement } from '../../../common/dom/helpers';
import { SELECTORS } from './selectors';
import { STYLES } from './styles';
import { getPathnameElement, getURLPathElement } from '../../../common/url';
import { removeNonDigit } from '../../../common/string';

const ADDITIONAL_LINKS_APPENDED_CLASS = 'additionalLinksAppended';
const SITE_NAMES = ['Яндекс', 'НаПоправку', 'DocDoc', 'Докту'];

export function appendAdditionalLinks(doctorName, linksContainer) {
    if (linksContainer.classList.contains(ADDITIONAL_LINKS_APPENDED_CLASS)) {
        return;
    }

    SITE_NAMES.forEach((siteName) => {
        appendAdditionalLink(doctorName, linksContainer, siteName);
    });

    linksContainer.classList.add(ADDITIONAL_LINKS_APPENDED_CLASS);
}

function appendAdditionalLink(doctorName, linksContainer, siteName) {
    const searchUrl = getSearchUrl(doctorName, siteName);
    const searchUrlLink = createLink({}, siteName, searchUrl);

    const lineBreak = document.createElement('br');
    linksContainer.append(lineBreak, searchUrlLink);
}

function getSearchUrl(doctorName, siteName) {
    const searchString = `${doctorName} ${siteName}`;
    const encodedSearchString = encodeURIComponent(searchString);
    return `https://www.google.com/search?q=${encodedSearchString}&btnI`;
}

export function appendDoctorPageAdditionalLinks() {
    const doctorCardName = getFirstElement(SELECTORS.DOCTOR_CARD_NAME, document, true);
    if (!doctorCardName) return;

    const doctorName = doctorCardName.innerText.trim();
    const linksContainer = createDiv();
    linksContainer.style.textAlign = 'center';
    const doctorIntroLeft = getFirstElement(SELECTORS.DOCTOR_INTRO_LEFT);
    doctorIntroLeft.append(linksContainer);
    appendAdditionalLinks(doctorName, linksContainer);
}

export function createReviewsInfoBlock(reviewsData, baseReviewsUrl, compactView = false) {
    const reviewsInfo = createDiv(STYLES.REVIEWS_INFO);
    reviewsInfo.classList.add('v-application');

    const reviewsInfoBlock = createDiv(STYLES.REVIEWS_INFO_BLOCK);
    reviewsInfoBlock.style.height = compactView ? '10px' : '23px';
    reviewsInfoBlock.append(reviewsInfo);

    reviewsData.slice(compactView ? 1 : 0)
        .forEach((reviewsCategoryData) => {
            const {
                category,
                title,
                count,
                bgClassSuffix,
            } = reviewsCategoryData;

            const href = `${baseReviewsUrl}?rates_category=${category}`;
            const linkText = compactView ? count : `${title} ${count}`;
            const reviewsCategoryInfo = createLink(STYLES.REVIEW_INFO, linkText, href);
            reviewsCategoryInfo.classList = getReviewsCategoryInfoClassString(bgClassSuffix);
            reviewsInfo.append(reviewsCategoryInfo);
        });

    return reviewsInfoBlock;
}

function getReviewsCategoryInfoClassString(bgClassSuffix) {
    return `text-caption ui-kit-color-text px-2 py-1 rounded ui-kit-bg-bg-${bgClassSuffix}`;
}

export function appendReviewsInfoBlockToHeader(reviewsInfoBlock) {
    const nameSpanHolder = getFirstElement(SELECTORS.NAME_SPAN_HOLDER, document, true);
    if (!nameSpanHolder) return;

    const nameSpan = getFirstElement(SELECTORS.NAME_SPAN, nameSpanHolder, true);
    if (!nameSpan) return;

    nameSpan.append(reviewsInfoBlock);
}

export function getDoctorIdFromPathname() {
    const doctorSection = getURLPathElement(3, 'unknown');
    return removeNonDigit(doctorSection);
}

export function getDoctorIdFromHref(doctorCardHref) {
    const doctorSection = getPathnameElement(doctorCardHref, 5, '');
    return removeNonDigit(doctorSection);
}
