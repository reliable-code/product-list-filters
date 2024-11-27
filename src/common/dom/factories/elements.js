import { debounce } from '../utils';
import { applyStyles } from '../helpers';

export function createTextInput(style, onChange, value) {
    const input = createInput(style, 'text', onChange);
    input.value = value;

    return input;
}

export function createNumberInput(style, onChange, value, step, min, max) {
    const input = createInput(style, 'number', onChange);
    input.value = value;
    input.step = step;
    input.min = min;
    input.max = max;

    return input;
}

export function createCheckboxInput(style, onChange, checked) {
    const input = createInput(style, 'checkbox', onChange);
    input.checked = checked;

    return input;
}

export function createInput(style = {}, type = null, inputOnChange = null) {
    const input = createElement('input', style);
    if (type) input.type = type;
    if (inputOnChange) {
        input.addEventListener('keyup', debounce(inputOnChange, 200));
        input.addEventListener('change', debounce(inputOnChange, 100));
    }

    return input;
}

export function createSpan(styles = {}, innerHTML = null) {
    return createElement('span', styles, innerHTML);
}

export function createLink(styles = {}, innerHTML = null, href = null) {
    const link = createElement('a', styles, innerHTML);
    if (href) link.href = href;

    return link;
}

export function createButton(styles = {}, innerHTML = null, onClick = null) {
    const button = createElement('button', styles, innerHTML);
    if (onClick) button.onclick = onClick;

    return button;
}

export function createDiv(styles = {}, innerHTML = null) {
    return createElement('div', styles, innerHTML);
}

export function createElement(tagName, styles, innerHTML = null) {
    if (typeof styles !== 'object' || styles === null) {
        throw new TypeError('styles should be an object');
    }

    const element = document.createElement(tagName);

    applyStyles(element, styles);

    if (innerHTML) element.innerHTML = innerHTML;

    return element;
}
