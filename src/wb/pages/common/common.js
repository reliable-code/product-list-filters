import { getPathnameElement } from '../../../common/url';

export const PRODUCT_CARD_NAME_SELECTOR = '.favorites-card__brand-wrap';

const INPUT_STYLE =
    'margin-left: 4px;';
export const NUMBER_INPUT_STYLE =
    INPUT_STYLE + // eslint-disable-line prefer-template
    'width: 60px;';
export const TEXT_INPUT_STYLE =
    INPUT_STYLE + // eslint-disable-line prefer-template
    'width: 180px;';
export const CONTROL_STYLE =
    'display: flex;' +
    'align-items: center;';
export const CHECKBOX_INPUT_STYLE =
    'margin-left: 5px;' +
    'width: 25px;' +
    'height: 25px;';

export function setCommonFiltersContainerStyles(filtersContainer) {
    filtersContainer.style =
        'display: flex;' +
        'grid-gap: 15px;' +
        'margin-top: 14px;';
}

export function getProductArticleFromLink(productCardLink) {
    const productCardLinkHref = productCardLink.getAttribute('href');

    return getPathnameElement(productCardLinkHref, 4, '');
}
