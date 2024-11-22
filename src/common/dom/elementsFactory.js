import { debounce } from './utils';
import { applyStyles } from './helpers';

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

export function createLink(href = null, innerHTML = null, style = null) {
    const link = document.createElement('a');
    if (href) link.href = href;
    if (innerHTML) link.innerHTML = innerHTML;
    if (style) link.style = style;

    return link;
}

export function createButton(styles = {}, innerHTML = null, onClick = null) {
    const button = createElement('button', styles, innerHTML);
    if (onClick) button.onclick = onClick;

    return button;
}

// todo: replace usages with createDiv()
export function createDivObsolete(textContent = null, style = null) {
    const div = document.createElement('div');
    if (textContent) div.textContent = textContent;
    if (style) div.style = style;

    return div;
}

export function createDiv(styles = {}, innerHTML = null) {
    return createElement('div', styles, innerHTML);
}

export function createElement(tagName, styles, innerHTML = null) {
    const element = document.createElement(tagName);

    if (Object.keys(styles).length > 0) {
        applyStyles(element, styles);
    }

    if (innerHTML) element.innerHTML = innerHTML;

    return element;
}
