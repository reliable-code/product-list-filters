const STYLES_BASE = {
    INPUT: {
        margin: '0px 5px',
        borderRadius: '7px',
        border: 'none',
        padding: '9px 11px',
        boxShadow: 'inset 0 0 0 1.5px #d2d0cc',
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
    TEXT_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '180px',
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '90px',
    },
    CHECKBOX_INPUT: {
        margin: '0px 5px',
        width: '23px',
        height: '23px',
    },
};
