export function removeNonDigit(stringValue) {
    return stringValue.replace(/\D/g, '');
}

export function removeSpaces(stringValue) {
    return stringValue.replace(/\s/g, '');
}
