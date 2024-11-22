import { createElement } from './elementsFactory';
import { capitalize } from '../string';

const elementTagNames = ['table', 'tr', 'th', 'td'];

export const {
    createTable,
    createTr,
    createTh,
    createTd,
} = Object.fromEntries(
    elementTagNames.map((tagName) => [
        `create${capitalize(tagName)}`,
        (styles = {}, innerHTML = null) => createElement(tagName, styles, innerHTML),
    ]),
);

export function createTableWithHeaders(
    tableStyles = {}, trStyles = {}, thStyles = {}, headers = {},
) {
    const table = createTable(tableStyles);

    const tr = createTr(trStyles);

    headers.forEach((header) => {
        const th = createTh(thStyles, header);
        tr.appendChild(th);
    });

    table.appendChild(tr);

    return table;
}
