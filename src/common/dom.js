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
    const filterControl = createFilterControl(titleText, controlStyle);
    const input = createBaseInput(inputOnChange, inputStyle);

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
    const filterControl = createFilterControl(titleText, controlStyle);
    const input = createBaseInput(inputOnChange, inputStyle);

    input.type = 'checkbox';
    input.checked = isChecked;

    filterControl.append(input);

    return filterControl;
}

function createBaseInput(inputOnChange, inputStyle) {
    const input = document.createElement('input');
    input.addEventListener('change', inputOnChange);
    input.style = inputStyle;

    return input;
}

export function createFilterControl(titleText, controlStyle = '') {
    const filterControl = document.createElement('div');
    filterControl.textContent = titleText;
    filterControl.style = controlStyle;

    return filterControl;
}

export function getFirstElementInnerNumber(parentNode, selector, cleanText) {
    const element = getFirstElement(parentNode, selector, true);
    const elementNumber = getElementInnerNumber(element, cleanText);

    return elementNumber;
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
