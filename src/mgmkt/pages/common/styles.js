const STYLES_BASE = {
    INPUT: {
        border: '1px solid #e4ebf0',
        fontSize: '14px',
        borderRadius: '8px',
        marginLeft: '7px',
        padding: '8px 14px',
    },
};
export const STYLES = {
    CONTAINER: {
        display: 'flex',
        gridGap: '15px',
        padding: '14px 5px',
    },
    CONTROL: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
    },
    TEXT_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '180px',
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
    },
    CHECKBOX_INPUT: {
        marginLeft: '7px',
        width: '23px',
        height: '23px',
    },
};
