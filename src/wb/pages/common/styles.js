const STYLES_BASE = {
    INPUT: {
        marginLeft: '5px',
        height: '36px',
        padding: '6px 12px',
    },
};

export const STYLES = {
    FILTERS_CONTAINER: {
        display: 'flex',
        gridGap: '20px',
        marginTop: '19px',
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '75px',
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
