const STYLES_BASE = {
    INPUT: {
        margin: '0px 4px',
    },
};
export const STYLES = {
    FILTERS_CONTAINER: {
        display: 'flex',
        gridGap: '15px',
        marginTop: '5px',
        fontSize: '15px',
    },
    CONTROL: {
        display: 'flex',
        alignItems: 'center',
    },
    TEXT_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '180px',
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '45px',
    },
    CHECKBOX_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '20px',
        height: '20px',
    },
};
