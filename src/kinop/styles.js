const STYLES_BASE = {
    INPUT: {
        marginLeft: '6px',
        padding: '4px 8px',
        fontSize: '12px',
    },
};
export const STYLES = {
    FILTERS_CONTAINER: {
        display: 'flex',
        gridGap: '12px',
        marginTop: '10px',
    },
    CONTROL: {
        display: 'flex',
        alignItems: 'center',
    },
    TEXT_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '160px',
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '45px',
    },
    CHECKBOX_INPUT: {
        marginLeft: '6px',
        width: '17px',
        height: '17px',
    },
};
