import { createStyledElement } from './elementsFactory';

export function createTable(styles = {}) {
    return createStyledElement('table', styles);
}
