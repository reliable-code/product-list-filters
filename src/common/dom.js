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
    const filterControl = createDiv(titleText, controlStyle);
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
    const filterControl = createDiv(titleText, controlStyle);
    const input = createBaseInput(inputOnChange, inputStyle);

    input.type = 'checkbox';
    input.checked = isChecked;

    filterControl.append(input);

    return filterControl;
}

function createBaseInput(inputOnChange, style) {
    const input = document.createElement('input');
    input.addEventListener('change', inputOnChange);
    input.style = style;

    return input;
}

export function createDiv(textContent = null, style = null) {
    const div = document.createElement('div');
    if (textContent) div.textContent = textContent;
    if (style) div.style = style;

    return div;
}

export function createMinRatingFilterControl(
    inputValue,
    inputOnChange,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlNumber(
        'Минимальный рейтинг: ',
        inputValue,
        '0.1',
        '3.0',
        '5.0',
        inputOnChange,
        controlStyle,
        inputStyle,
    );
}

export function createMinReviewsFilterControl(
    inputValue,
    inputOnChange,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlNumber(
        'Минимально отзывов: ',
        inputValue,
        '1',
        '1',
        '999999',
        inputOnChange,
        controlStyle,
        inputStyle,
    );
}

export function createMinDiscountFilterControl(
    inputValue,
    inputOnChange,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlNumber(
        'Минимальная скидка: ',
        inputValue,
        '1',
        '0',
        '100',
        inputOnChange,
        controlStyle,
        inputStyle,
    );
}

export function createNoRatingFilterControl(
    isChecked,
    inputOnChange,
    controlStyle = '',
    inputStyle = '',
) {
    return createFilterControlCheckbox(
        'Без рейтинга: ',
        isChecked,
        inputOnChange,
        controlStyle,
        inputStyle,
    );
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

export function appendFilterControlsIfNeeded(
    parentNode,
    appendFiltersContainerFunc,
    filtersContainerId = 'customFiltersContainer',
) {
    let filtersContainer = getFirstElement(`#${filtersContainerId}`, parentNode);

    if (filtersContainer) {
        return;
    }

    filtersContainer = document.createElement('div');
    filtersContainer.id = filtersContainerId;

    appendFiltersContainerFunc(filtersContainer, parentNode);
}
