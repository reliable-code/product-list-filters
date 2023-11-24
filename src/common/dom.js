import { removeNonNumber } from './string';

export function getFirstElement(selector, parentNode = document, logNotFound = false) {
    const element = parentNode.querySelector(selector);

    if (logNotFound && !element) console.log(`No element found for selector: ${selector}`);

    return element;
}

export function getAllElements(selector, parentNode = document, logNotFound = false) {
    const elements = parentNode.querySelectorAll(selector);

    if (logNotFound && !elements.length) console.log(`No elements found for selector: ${selector}`);

    return elements;
}

export function insertAfter(existingNode, newNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

export function hideElement(element) {
    setElementDisplay(element, 'none');
}

export function showElement(element, display = 'block') {
    setElementDisplay(element, display);
}

export function showHideElement(element, conditionToHide, display = 'block') {
    if (conditionToHide) {
        hideElement(element);
    } else {
        showElement(element, display);
    }
}

function setElementDisplay(element, display) {
    element.style.display = display;
}

export function defineElementOpacity(element, conditionToDefine, opacity = 0.2) {
    if (conditionToDefine) {
        setElementOpacity(element, opacity);
    } else {
        resetElementOpacity(element);
    }
}

export function resetElementOpacity(element) {
    element.style.opacity = '';
}

export function setElementOpacity(element, opacity = 0.2) {
    element.style.opacity = opacity;
}

export function resetElementOrder(element) {
    element.style.order = '';
}

export function setElementOrder(element, order) {
    element.style.order = order;
}

export function setElementBackground(element, background) {
    element.style.background = background;
}

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
    if (inputOnChange) input.addEventListener('change', inputOnChange);
    if (style) input.style = style;

    return input;
}

export function createDiv(textContent = null, style = null) {
    const div = document.createElement('div');
    if (textContent) div.textContent = textContent;
    if (style) div.style = style;

    return div;
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

export function getFirstElementInnerNumber(parentNode, selector, cleanText) {
    const element = getFirstElement(selector, parentNode, true);
    const elementNumber = getElementInnerNumber(element, cleanText);

    return elementNumber;
}

export function getElementInnerNumber(element, cleanText = false, replaceComma = false) {
    let elementText = element.innerText;
    if (cleanText) elementText = removeNonNumber(elementText);
    if (replaceComma) elementText = elementText.replace(',', '.');
    const elementNumber = +elementText;

    return elementNumber;
}

export function getArrayElementInnerNumber(array, elementIndex, cleanText = false) {
    const element = array[elementIndex];
    const elementNumber = getElementInnerNumber(element, cleanText);

    return elementNumber;
}

export function waitForElement(parentNode, selector, timeout = null) {
    return new Promise((resolve) => {
        const observer = new MutationObserver(mutationCallback);

        observer.observe(parentNode, {
            childList: true,
            subtree: true,
        });

        let timeoutId = null;
        if (timeout) {
            timeoutId = setTimeout(
                () => {
                    observer.disconnect();
                    console.log(`No element found for selector: ${selector}`);
                    resolve(null);
                },
                timeout,
            );
        }

        function mutationCallback() {
            if (parentNode.querySelector(selector)) {
                if (timeoutId) clearTimeout(timeoutId);
                observer.disconnect();
                resolve(parentNode.querySelector(selector));
            }
        }
    });
}

export function addGlobalStyle(css) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = css;
    document.head.appendChild(style);
}

export function getInputValueFromEvent(event) {
    const { target } = event;
    const { type } = target;

    let inputValue;

    switch (type) {
        case 'text':
        case 'number':
            inputValue = target.value;
            break;
        case 'checkbox':
            inputValue = target.checked;
            break;
        default:
            console.log(`Unknown input type: ${type}`);
            return null;
    }

    return parseValue(inputValue);
}

export class InputValueBase {
    constructor(value, onChange) {
        this.value = value;
        this.onChange = onChange;
    }

    onChangeIfDefined = () => {
        if (this.onChange) this.onChange();
    };
}

export class InputValue extends InputValueBase {
    constructor(defaultValue = null, onChange = null) {
        super(defaultValue, onChange);
    }

    updateValueFromEvent = (event) => {
        this.value = getInputValueFromEvent(event);
        this.onChangeIfDefined();
    };
}

export function parseValue(value) {
    return value === '' ? null : JSON.parse(value);
}
