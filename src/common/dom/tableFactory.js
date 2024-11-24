import { createElement } from './elementsFactory';
import { capitalize } from '../string';

const elementTagNames = ['table', 'thead', 'tbody', 'tr', 'th', 'td'];

export const {
    createTable,
    createThead,
    createTbody,
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
    const thead = createThead(tableStyles);
    const tbody = createTbody(tableStyles);
    const tr = createTr(trStyles);

    headers.forEach((header) => {
        const th = createTh(thStyles, header);
        tr.appendChild(th);
    });

    thead.appendChild(tr);
    table.appendChild(thead);
    table.appendChild(tbody);

    return table;
}
