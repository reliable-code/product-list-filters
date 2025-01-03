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
    SCROLL_TO_FILTERS_BUTTON: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px 10px 14px',
        backgroundColor: '#a73afd',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s',
        display: 'none',
        gap: '4px',
    },
};
