import { debounce } from './utils';

// todo: change text styles to object
export function createTextInput(inputOnChange, inputStyle, inputValue) {
    const input = createInput('text', inputOnChange, inputStyle);
    input.value = inputValue;

    return input;
}

export function createNumberInput(
    inputOnChange, inputStyle, inputValue, inputStep, inputMinValue, inputMaxValue,
) {
    const input = createInput('number', inputOnChange, inputStyle);
    input.value = inputValue;
    input.step = inputStep;
    input.min = inputMinValue;
    input.max = inputMaxValue;

    return input;
}

export function createCheckboxInput(inputOnChange, inputStyle, isChecked) {
    const input = createInput('checkbox', inputOnChange, inputStyle);
    input.checked = isChecked;

    return input;
}

export function createInput(type = null, inputOnChange = null, style = null) {
    const input = document.createElement('input');
    if (type) input.type = type;
    if (inputOnChange) {
        input.addEventListener('keyup', debounce(inputOnChange, 200));
        input.addEventListener('change', debounce(inputOnChange, 100));
    }

    if (style) input.style = style;

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

    Object.assign(element.style, styles);

    if (innerHTML) element.innerHTML = innerHTML;

    return element;
}
