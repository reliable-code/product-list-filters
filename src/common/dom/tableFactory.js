import { createStyledElement } from './elementsFactory';

export function createTable(styles = {}) {
    return createStyledElement('table', styles);
}

export function createRow(styles = {}) {
    return createStyledElement('tr', styles);
}
