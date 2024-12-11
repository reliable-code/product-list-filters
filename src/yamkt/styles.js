const STYLES_BASE = {
    INPUT: {
        margin: '0px 5px',
    },
};

export const STYLES = {
    FILTER_CONTROLS: {
        display: 'flex',
        gap: '15px',
        padding: '0 10px 15px',
        fontSize: '16px',
        fontWeight: 500,
    },
    CONTROL: {
        display: 'flex',
        alignItems: 'center',
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
        borderRadius: '7px',
        border: 'none',
        padding: '9px 11px',
        boxShadow: 'inset 0 0 0 1.5px #d2d0cc',
    },
    CHECKBOX_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '23px',
        height: '23px',
    },
};
