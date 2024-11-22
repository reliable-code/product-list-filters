import { applyStyles } from './helpers';

export function createTable(styles = {}) {
    const table = document.createElement('table');
    if (styles) applyStyles(table, styles);

    return table;
}
