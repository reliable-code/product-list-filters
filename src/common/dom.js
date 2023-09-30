export function getElementInnerNumber(element, cleanText = false) {
    let elementText = element.innerText;
    if (cleanText) elementText = elementText.replace(/\D/g, '');
    const elementNumber = +elementText;

    return elementNumber;
}

