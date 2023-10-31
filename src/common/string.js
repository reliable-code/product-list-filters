export function removeNonDigit(stringValue) {
    return stringValue.replace(/\D/g, '');
}

export function removeNonNumber(stringValue) {
    return stringValue.replace(/[^\d.,-]/g, '');
}

export function removeSpaces(stringValue) {
    return stringValue.replace(/\s/g, '');
}
