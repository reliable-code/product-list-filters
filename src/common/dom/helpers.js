import { removeNonNumber } from '../string';

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

// todo: move to storage utils
export function parseValue(value) {
    return value === '' ? null : JSON.parse(value);
}
