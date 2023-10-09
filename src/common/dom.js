import { removeNonDigit } from './string';

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

function setElementDisplay(element, display) {
    element.style.display = display;
}

export function createInput(type = null, inputOnChange = null, style = null) {
    const input = document.createElement('input');
    if (type) input.type = type;
    if (inputOnChange) input.addEventListener('change', inputOnChange);
    if (style) input.style = style;

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

export function createDiv(textContent = null, style = null) {
    const div = document.createElement('div');
    if (textContent) div.textContent = textContent;
    if (style) div.style = style;

    return div;
}

export function createLink(href, innerHTML = null, style = null) {
    const link = document.createElement('a');
    link.href = href;
    if (innerHTML) link.innerHTML = innerHTML;
    if (style) link.style = style;

    return link;
}

export function getFirstElementInnerNumber(parentNode, selector, cleanText) {
    const element = getFirstElement(selector, parentNode, true);
    const elementNumber = getElementInnerNumber(element, cleanText);

    return elementNumber;
}

export function getElementInnerNumber(element, cleanText = false) {
    let elementText = element.innerText;
    if (cleanText) elementText = removeNonDigit(elementText);
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
