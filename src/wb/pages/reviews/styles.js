import { STYLES as COMMON_STYLES, STYLES_BASE } from '../common/styles';

export const STYLES = {
    FILTERS_CONTAINER: {
        ...STYLES_BASE.FILTERS_CONTAINER,
        flexFlow: 'wrap',
    },
    NUMBER_INPUT: COMMON_STYLES.NUMBER_INPUT,
    TEXT_INPUT: {
        ...STYLES_BASE.INPUT,
        width: '415px',
    },
    CONTROL: COMMON_STYLES.CONTROL,
    CHECKBOX_INPUT: COMMON_STYLES.CHECKBOX_INPUT,
};
