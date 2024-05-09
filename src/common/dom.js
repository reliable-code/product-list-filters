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

export function showElement(element, display) {
    display = display || getElementDisplay(element);
    setElementDisplay(element, display);
}

export function showHideElement(element, conditionToHide, display = 'block') {
    if (conditionToHide) {
        hideElement(element);
    } else {
        display = display || getElementDisplay(element);
        showElement(element, display);
    }
}

function setElementDisplay(element, display) {
    element.style.display = display;
}

function getElementDisplay(element) {
    if (!element.hasAttribute('display')) {
        const { display } = getComputedStyle(element);
        element.setAttribute('display', display);
    }

    return element.getAttribute('display');
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

export function getFirstElementInnerNumber(parentNode, selector, cleanText) {
    const element = getFirstElement(selector, parentNode, true);
    const elementNumber = getElementInnerNumber(element, cleanText);

    return elementNumber;
}

export function getElementInnerNumber(element, cleanText = false, replaceComma = false) {
    const elementText = element.innerText;
    return parseNumber(elementText, cleanText, replaceComma);
}

export function getArrayElementInnerNumber(array, elementIndex, cleanText = false) {
    const element = array[elementIndex];
    const elementNumber = getElementInnerNumber(element, cleanText);

    return elementNumber;
}

export function getNodeInnerNumber(node, cleanText = false, replaceComma = false) {
    const nodeText = node.textContent;
    return parseNumber(nodeText, cleanText, replaceComma);
}

function parseNumber(text, cleanText, replaceComma) {
    if (cleanText) text = removeNonNumber(text);
    if (replaceComma) text = text.replace(',', '.');
    const number = +text;

    return number;
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

export function debounce(func, wait = 250) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), wait);
    };
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

    switch (type) {
        case 'text':
            return `"${target.value}"`;
        case 'number':
            return target.value;
        case 'checkbox':
            return target.checked;
        default:
            console.log(`Unknown input type: ${type}`);
            return null;
    }
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
        const newParsedValue = parseValue(getInputValueFromEvent(event));

        if (this.value === newParsedValue) return;

        this.value = newParsedValue;
        this.onChangeIfDefined();
    };
}

export function parseValue(value) {
    return value === '' ? null : JSON.parse(value);
}

export function getURLPathElement(position, defaultValue = 'common', logResult = false) {
    const { pathname } = window.location;

    return getPathnameElement(pathname, position, defaultValue, logResult);
}

function getPathnameElement(pathname, position, defaultValue, logResult) {
    const pathElements = pathname.split('/');

    const pathElement = pathElements[position] || defaultValue;

    if (logResult) console.log(`Pathname element: ${pathElement}`);

    return pathElement;
}

export function getURLPathElementEnding(position, defaultValue = 'common', logResult = false) {
    const pathElement = getURLPathElement(position, '', logResult);

    return getPathElementEnding(pathElement, defaultValue, logResult);
}

function getPathElementEnding(pathElement, defaultValue, logResult) {
    if (!pathElement) return defaultValue;

    const pathElementEnding = pathElement.split('-')
        .at(-1);

    if (logResult) console.log(`Pathname element ending: ${pathElementEnding}`);

    return pathElementEnding;
}

export function getPathnameElementEnding(pathname, position, defaultValue = 'common', logResult = false) {
    const pathElement = getPathnameElement(pathname, position, '', logResult);

    return getPathElementEnding(pathElement, defaultValue, logResult);
}

export function pathnameIncludes(searchString) {
    return window.location.pathname.includes(searchString);
}
