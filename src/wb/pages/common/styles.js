const STYLES_BASE = {
    INPUT: {
        marginLeft: '5px',
        height: '36px',
        padding: '6px 12px',
    },
    FILTERS_CONTAINER: {
        display: 'flex',
        gridGap: '20px',
    },
};

export const STYLES = {
    PRODUCTS_FILTERS_CONTAINER: {
        ...STYLES_BASE.FILTERS_CONTAINER,
        margin: '19px auto 0',
        maxWidth: '1435px',
    },
    REVIEWS_FILTERS_CONTAINER: {
        ...STYLES_BASE.FILTERS_CONTAINER,
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '75px',
    },
    PRICE_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '100px',
    },
    TEXT_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '200px',
    },
    CONTROL: {
        display: 'flex',
        alignItems: 'center',
    },
    CHECKBOX_INPUT: {
        marginLeft: '5px',
        width: '25px',
        height: '25px',
    },
};
