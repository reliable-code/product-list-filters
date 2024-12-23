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

export function findElementByText(parentElement, selector, text) {
    return [...parentElement.querySelectorAll(selector)].find(
        (element) => element.textContent.trim()
            .includes(text),
    );
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
            return null;
        }
        return defaultValue;
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

export function applyStyles(element, styles) {
    Object.assign(element.style, styles);
}

export function styleObjectToString(styleObject) {
    return Object.entries(styleObject)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1')
            .toLowerCase()}: ${value};`)
        .join(' ');
}

export function styleStringToObject(styleString) {
    if (!styleString) return {};

    return styleString
        .split(';')
        .filter((rule) => rule.trim() !== '')
        .reduce((styleObject, rule) => {
            const [key, value] = rule.split(':')
                .map((item) => item.trim());
            const camelCaseKey = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
            styleObject[camelCaseKey] = value;
            return styleObject;
        }, {});
}

export function highlightSubstring(container, substring) {
    const regex = new RegExp(`(${substring})`, 'gi');

    container.innerHTML = container.innerHTML.replace(
        regex,
        '<span class="highlightedSubstring" style="background-color: yellow;">$1</span>',
    );
}

export function removeHighlights(container) {
    const highlights = getAllElements('.highlightedSubstring', container);
    highlights.forEach((span) => {
        span.replaceWith(span.textContent);
    });
}
