export function parseValue(value) {
    return value === '' ? null : JSON.parse(value);
}
