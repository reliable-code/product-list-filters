export function removeNonDigit(stringValue) {
    return stringValue.replace(/\D/g, '');
}

export function removeNonNumber(stringValue) {
    return stringValue.replace(/[^\d.,-]/g, '');
}

export function removeSpaces(stringValue) {
    return stringValue.replace(/\s/g, '');
}

export function capitalize(stringValue) {
    return stringValue.charAt(0)
        .toUpperCase() + stringValue.slice(1);
}

export function normalizeSpacing(stringValue) {
    return stringValue.replace(/\s+/g, ' ')
        .trim();
}
