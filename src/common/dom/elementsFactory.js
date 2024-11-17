import { debounce } from './utils';

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

export function createDiv(textContent = null, style = null) {
    const div = document.createElement('div');
    if (textContent) div.textContent = textContent;
    if (style) div.style = style;

    return div;
}

export function createSpan(textContent = null, style = null) {
    const span = document.createElement('span');
    if (textContent) span.textContent = textContent;
    if (style) span.style = style;

    return span;
}

export function createLink(href = null, innerHTML = null, style = null) {
    const link = document.createElement('a');
    if (href) link.href = href;
    if (innerHTML) link.innerHTML = innerHTML;
    if (style) link.style = style;

    return link;
}

export function createButton(innerHTML = null, onClick = null, style = null) {
    const button = document.createElement('button');
    if (innerHTML) button.innerHTML = innerHTML;
    if (onClick) button.onclick = onClick;
    if (style) button.style = style;

    return button;
}
