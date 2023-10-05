export function getFirstElement(parentNode, selector, logNotFound = false) {
    const element = parentNode.querySelector(selector);

    if (logNotFound && !element) console.log(`No element found for selector: ${selector}`);

    return element;
}

export function getAllElements(parentNode, selector, logNotFound = false) {
    const elements = parentNode.querySelectorAll(selector);

    if (logNotFound && !elements.length) console.log(`No elements found for selector: ${selector}`);

    return elements;
}

export function insertAfter(existingNode, newNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

export function updateInput(keyName, e) {
    const { target } = e;
    const { type } = target;

    if (type === 'number') {
        localStorage.setItem(keyName, target.value);
    } else if (type === 'checkbox') {
        localStorage.setItem(keyName, target.checked);
    }

    window.location.reload();
}

export function createFilterControlNumber(
    titleText,
    inputValue,
    inputStep,
    inputMinValue,
    inputMaxValue,
    inputOnChange,
    controlStyle = '',
    inputStyle = '',
) {
    const {
        filterControl,
        input,
    } = createFilterControlBase(controlStyle, titleText, inputOnChange, inputStyle);

    input.type = 'number';
    input.value = inputValue;
    input.step = inputStep;
    input.min = inputMinValue;
    input.max = inputMaxValue;

    filterControl.append(input);

    return filterControl;
}

export function createFilterControlCheckbox(
    titleText,
    isChecked,
    inputOnChange,
    controlStyle = '',
    inputStyle = '',
) {
    const {
        filterControl,
        input,
    } = createFilterControlBase(controlStyle, titleText, inputOnChange, inputStyle);

    input.type = 'checkbox';
    input.checked = isChecked;

    filterControl.append(input);

    return filterControl;
}

function createFilterControlBase(controlStyle, titleText, inputOnChange, inputStyle) {
    const filterControl = document.createElement('div');
    filterControl.style = controlStyle;
    filterControl.textContent = titleText;

    const input = document.createElement('input');
    input.addEventListener('change', inputOnChange);
    input.style = inputStyle;

    return {
        filterControl,
        input,
    };
}

export function getElementInnerNumber(element, cleanText = false) {
    let elementText = element.innerText;
    if (cleanText) elementText = elementText.replace(/\D/g, '');
    const elementNumber = +elementText;

    return elementNumber;
}

export function getChildElementInnerNumber(element, childIndex, cleanText = false) {
    const childElement = element[childIndex];
    const elementNumber = getElementInnerNumber(childElement, cleanText);

    return elementNumber;
}

export function waitForElement(selector) {
    return new Promise((resolve) => {
        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}
