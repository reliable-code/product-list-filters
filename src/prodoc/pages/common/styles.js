const STYLES_BASE = {
    INPUT: {
        border: '1px solid #c7d3d9',
        borderRadius: '10px',
        padding: '7px 14px',
        marginLeft: '6px',
    },
};

export const STYLES = {
    FILTERS_CONTAINER: {
        display: 'flex',
        gridGap: '15px',
        marginTop: '5px',
        flexFlow: 'wrap',
    },
    CONTROL: {
        display: 'flex',
        alignItems: 'center',
    },
    TEXT_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '195px',
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '70px',
    },
    CHECKBOX_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '20px',
        height: '20px',
    },
    REVIEWS_INFO: {
        gridGap: '6px',
    },
    REVIEWS_INFO_BLOCK: {
        marginTop: '5px',
    },
    REVIEW_INFO: {
        textDecoration: 'none',
    },
};
