import { removeNonNumber } from './string';
import { InputValueBase } from './models/inputValueBase';

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
    setElementDisplayAttributeIfNeeded(element);
    setElementDisplay(element, 'none');
}

export function showElement(element, display) {
    display = display || getElementDisplay(element);
    setElementDisplay(element, display);
}

export function showHideElement(element, conditionToHide, display) {
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
    setElementDisplayAttributeIfNeeded(element);

    return element.getAttribute('display');
}

function setElementDisplayAttributeIfNeeded(element) {
    if (element.hasAttribute('display')) return;

    const { display } = getComputedStyle(element);
    element.setAttribute('display', display);
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

export function getFirstElementInnerNumber(
    parentNode, selector, cleanText = false, replaceComma = false,
) {
    const element = getFirstElement(selector, parentNode, true);
    const elementNumber = getElementInnerNumber(element, cleanText, replaceComma);

    return elementNumber;
}

export function getElementInnerNumber(
    element, cleanText = false, replaceComma = false, defaultValue = null,
) {
    if (!element) {
        if (defaultValue === null) {
            console.log('No element found');
        } else {
            return defaultValue;
        }
    }

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
        const existingElement = parentNode.querySelector(selector);

        if (existingElement) {
            resolve(existingElement);
            return;
        }

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
