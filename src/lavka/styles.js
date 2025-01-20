const STYLES_BASE = {
    CONTROL: {
        display: 'flex',
        alignItems: 'center',
    },
    INPUT: {
        marginLeft: '5px',
        border: '2px solid #b3bcc5',
        borderRadius: '6px',
        padding: '6px 10px',
    },
};
export const STYLES = {
    CONTAINER: {
        display: 'flex',
        marginTop: '14px',
        gridGap: '15px',
    },
    CONTROL: STYLES_BASE.CONTROL,
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '90px',
    },
    CHECKBOX_INPUT: {
        marginLeft: '5px',
        width: '25px',
        height: '25px',
        appearance: 'auto',
    },
    RELOAD_TIMER_CONTROL: {
        ...STYLES_BASE.CONTROL,
        marginLeft: 'auto',
        width: '170px',
    },
};
