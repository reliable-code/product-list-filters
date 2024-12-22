const STYLES_BASE = {
    INPUT: {
        marginLeft: '5px',
        border: '2px solid #b3bcc5',
        borderRadius: '6px',
        padding: '6px 10px',
    },
};

export const STYLES = {
    FILTERS_CONTAINER: {
        display: 'flex',
        flexFlow: 'wrap',
        gap: '15px',
        minWidth: '1250px',
        paddingBottom: '14px',
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '75px',
    },
    TEXT_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '180px',
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
    DISLIKE_BUTTON: {
        display: 'inline-flex',
        alignItems: 'center',
        marginLeft: 'auto',
        color: 'rgba(0, 26, 52, 0.6)',
        cursor: 'pointer',
    },
    SCROLL_TO_FILTERS_BUTTON: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px 10px 14px',
        backgroundColor: '#005bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s',
        display: 'flex',
        gap: '4px',
    },
};
