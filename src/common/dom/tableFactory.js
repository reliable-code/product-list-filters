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
