const STYLES_BASE = {
    INPUT: {
        marginLeft: '5px',
        border: '1px solid #C9C9C9',
        borderRadius: '8px',
        height: '40px',
        padding: '0 16px',
    },
};
export const STYLES = {
    FILTERS_CONTAINER: {
        display: 'flex',
        gridGap: '15px',
        marginLeft: '10px',
    },
    CONTROL: {
        display: 'flex',
        alignItems: 'center',
    },
    TEXT_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '170px',
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
    },
    CHECKBOX_INPUT: {
        marginLeft: '5px',
        border: '1px solid #C9C9C9',
        borderRadius: '4px',
        width: '22px',
        height: '22px',
    },
};
