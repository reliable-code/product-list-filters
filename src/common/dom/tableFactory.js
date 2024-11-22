import { createElement } from './elementsFactory';

export function createTable(styles = {}, innerHTML = null) {
    return createElement('table', styles, innerHTML);
}

export function createTr(styles = {}, innerHTML = null) {
    return createElement('tr', styles, innerHTML);
}

export function createTh(styles = {}, innerHTML = null) {
    return createElement('th', styles, innerHTML);
}

export function createTd(styles = {}, innerHTML = null) {
    return createElement('td', styles, innerHTML);
}
