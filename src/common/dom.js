export function updateInput(keyName, e) {
    localStorage.setItem(keyName, e.target.value);
    window.location.reload();
}

export function createDefaultFilterControl(
    titleText,
    inputValue,
    inputStep,
    inputMinValue,
    inputMaxValue,
    inputOnChange,
    controlStyle = '',
    inputStyle = '',
) {
    const filterControl = document.createElement('div');
    filterControl.style = controlStyle;
    filterControl.textContent = titleText;

    const input = document.createElement('input');
    input.style = inputStyle;
    input.type = 'number';
    input.value = inputValue;
    input.step = inputStep;
    input.min = inputMinValue;
    input.max = inputMaxValue;
    input.addEventListener('change', inputOnChange);
    filterControl.appendChild(input);

    return filterControl;
}

export function getElementInnerNumber(element, cleanText = false) {
    let elementText = element.innerText;
    if (cleanText) elementText = elementText.replace(/\D/g, '');
    const elementNumber = +elementText;

    return elementNumber;
}
