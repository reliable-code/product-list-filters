export const SELECTORS = {
    COMMENTS: '#comments',
    CONTROLS_CONTAINER: '[data-widget="webListReviews"] > div',
    REVIEWS_LIST: '[data-widget="webListReviews"]',
    REVIEWS: '[data-widget="webListReviews"] > div > div > div[data-review-uuid]',
    REVIEW_TEXT_WRAP: ':scope > div:nth-of-type(1) > div:nth-of-type(2)',
    REVIEW_TEXT: ':scope > div:nth-of-type(2) > div > div > span',
    REVIEW_FOOTER: ':scope > div:nth-of-type(1) > div:nth-of-type(3)',
    UNNECESSARY_ELEMENTS: '[data-widget="separator"], [data-widget="skuGrid"]',
};
