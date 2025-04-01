const STYLES_BASE = {
    INPUT: {
        marginLeft: '6px',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        padding: '7px 14px 6px',
        fontSize: '15px',
    },
};
export const STYLES = {
    FILTERS_CONTAINER: {
        display: 'flex',
        gridGap: '12px',
        paddingTop: '8px',
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
        width: '80px',
    },
    CHECKBOX_INPUT: {
        marginLeft: '6px',
        width: '21px',
        height: '21px',
        webkitAppearance: 'auto',
    },
};
