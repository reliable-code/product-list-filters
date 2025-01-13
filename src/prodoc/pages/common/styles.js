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
        flexShrink: 0,
    },
    REVIEW_INFO_TOOLTIP: {
        position: 'absolute',
        backgroundColor: '#333',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: '1000',
        pointerEvents: 'none',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },
};
