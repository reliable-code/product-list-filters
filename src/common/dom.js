export function getElementInnerNumber(element, cleanText = false) {
    let elementText = element.innerText;
    if (cleanText) elementText = elementText.replace(/\D/g, '');
    const elementNumber = +elementText;

    return elementNumber;
}

export function updateInput(keyName, e) {
    localStorage.setItem(keyName, e.target.value);
    window.location.reload();
}
