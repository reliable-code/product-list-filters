const STYLES_BASE = {
    INPUT: {
        marginLeft: '6px',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        padding: '7px 14px',
        fontSize: '15px',
    },
};
export const STYLES = {
    FILTERS_CONTAINER: {
        display: 'flex',
        gridGap: '12px',
        paddingBottom: '12px',
    },
    CONTROL: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '15px',
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
        marginLeft: '6px',
        width: '21px',
        height: '21px',
    },
};
