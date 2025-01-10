import { createDiv, createLink } from '../../../common/dom/factories/elements';
import { getFirstElement } from '../../../common/dom/helpers';
import { SELECTORS } from './selectors';

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

export function appendReviewsInfoBlockToHeader(filters, baseReviewsUrl) {
    const nameSpanHolder = getFirstElement(SELECTORS.NAME_SPAN_HOLDER, document, true);
    if (!nameSpanHolder) return;

    const nameSpan = getFirstElement(SELECTORS.NAME_SPAN, nameSpanHolder, true);
    if (!nameSpan) return;

    const reviewsInfo = createDiv({ gridGap: '6px' });
    reviewsInfo.classList.add('v-application');

    const reviewsInfoBlock = createDiv({
        height: '23px',
        marginTop: '5px',
    });

    reviewsInfoBlock.append(reviewsInfo);

    filters.forEach((filter) => {
        const link = `${baseReviewsUrl}?rates_category=${filter.category}`;
        const headerFilter = createLink(
            { textDecoration: 'none' }, `${filter.title} ${filter.count}`, link,
        );
        headerFilter.classList = filter.classList;
        reviewsInfo.append(headerFilter);
    });

    nameSpan.append(reviewsInfoBlock);
}
