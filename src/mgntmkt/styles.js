const STYLES_BASE = {
    input: {
        marginLeft: '5px',
        border: '1px solid rgba(0,0,0,.12)',
        borderRadius: '4px',
        color: 'rgba(0,0,0,.87)',
        fontFamily: 'Roboto,sans-serif',
        fontSize: '.875rem',
        padding: '8px 11px',
    },
};
export const STYLES = {
    filtersContainer: {
        display: 'flex',
        gridGap: '11px',
        marginBottom: '17px',
    },
    control: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '15px',
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
        width: '23px',
        height: '23px',
    },
};
