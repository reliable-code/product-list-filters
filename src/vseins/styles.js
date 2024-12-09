const STYLES_BASE = {
    input: {
        marginLeft: '5px',
        border: '1px solid #dadcde',
        borderRadius: '8px',
        padding: '8px 16px',
        fontSize: '16px',
    },
};

export const STYLES = {
    filtersContainer: {
        display: 'flex',
        gridGap: '11px',
        marginBottom: '18px',
    },
    control: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '16px',
    },
    textInput: {
        ...STYLES_BASE.input,
        width: '180px',
    },
    numberInput: {
        ...STYLES_BASE.input,
        width: '90px',
    },
    checkboxInput: {
        marginLeft: '5px',
        width: '22px',
        height: '22px',
    },
};
