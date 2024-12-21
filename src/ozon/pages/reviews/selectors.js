const SELECTORS_BASE = {
    REVIEWS_LIST_WRAP: '[data-widget="webListReviews"]',
};

export const SELECTORS = {
    COMMENTS: '#comments',
    CONTROLS_CONTAINER: `${SELECTORS_BASE.REVIEWS_LIST_WRAP} > div`,
    REVIEWS_LIST: `${SELECTORS_BASE.REVIEWS_LIST_WRAP} > div:nth-of-type(2)`,
    REVIEWS: `${SELECTORS_BASE.REVIEWS_LIST_WRAP} > div:nth-of-type(2) > div`,
    REVIEW_TEXT_WRAP: ':scope > div:nth-of-type(1) > div:nth-of-type(2)',
    REVIEW_FOOTER: ':scope > div:nth-of-type(1) > div:nth-of-type(3)',
};
