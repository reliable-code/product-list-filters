import { COMMON_STYLES, STYLES_BASE } from '../common/styles';

export const STYLES = {
    FILTERS_CONTAINER: COMMON_STYLES.FILTERS_CONTAINER,
    FILTERS_CONTAINER_WRAP: {
        display: 'grid',
        gap: '10px',
        paddingBottom: '0',
    },
    NUMBER_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '78px',
    },
    TEXT_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '330px',
    },
    CHECKBOX_INPUT: COMMON_STYLES.CHECKBOX_INPUT,
    CONTROL: COMMON_STYLES.CONTROL,
    DOWNLOAD_CONTROL: {
        ...COMMON_STYLES.CONTROL,
        margin: '0 19px 0 auto',
    },
};
