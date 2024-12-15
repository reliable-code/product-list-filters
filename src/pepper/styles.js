const STYLES_BASE = {
    INPUT: {
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        marginLeft: '7px',
    },
};
export const STYLES = {
    FILTERS_CONTAINER: {
        display: 'flex',
        gridGap: '15px',
        padding: '11px 19px',
        marginBottom: '.5rem',
        backgroundColor: '#fff',
        borderWidth: '1px',
        borderColor: 'rgb(229, 229, 229)',
        borderRadius: '10px',
        position: 'sticky',
        zIndex: '11',
        top: '-1px',
    },
    CONTROL: {
        display: 'flex',
        alignItems: 'center',
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
        padding: '7px 14px',
        backgroundColor: '#fff',
    },
    CHECKBOX_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '24px',
        height: '24px',
    },
};
