import { createLink } from '../../../common/dom/factories/elements';

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
    const searchString = `${doctorName} ${siteName}`;
    const encodedSearchString = encodeURIComponent(searchString);

    const lineBreak = document.createElement('br');

    const href = `https://www.google.com/search?q=${encodedSearchString}&btnI`;
    const searchUrlLink = createLink({}, siteName, href);

    linksContainer.append(lineBreak, searchUrlLink);
}
