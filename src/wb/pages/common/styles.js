const STYLES_BASE = {
    INPUT: {},
};

export const STYLES = {
    FILTERS_CONTAINER: {
        display: 'flex',
        gridGap: '15px',
        marginTop: '14px',
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '75px',
    },
    TEXT_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '180px',
    },
    CONTROL: {},
    CHECKBOX_INPUT: {},
};
