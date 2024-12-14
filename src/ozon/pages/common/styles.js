const STYLES_BASE = {
    INPUT: {
        marginLeft: '5px',
        border: '2px solid #b3bcc5',
        borderRadius: '6px',
        padding: '6px 10px',
    },
};

export const STYLES = {
    FILTERS_CONTAINER: {
        display: 'flex',
        flexFlow: 'wrap',
        gap: '15px',
        minWidth: '1250px',
    },
    FILTERS_CONTAINER_WRAP: {
        position: 'sticky',
        top: '2px',
        backgroundColor: '#fff',
        zIndex: 2,
        paddingBottom: '11px',
        marginBottom: 0,
        gap: '15px',
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '75px',
    },
    TEXT_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '180px',
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
