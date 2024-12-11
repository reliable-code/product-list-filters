import { fnv1aHash32 } from './fnv1a';

export function getHash(value) {
    // Convert to hex, and ensure it has 8 characters
    return fnv1aHash32(value)
        .toString(16)
        .padStart(8, '0');
}

export function getHashOrDefault(value, defaultValue = 'common') {
    return value ? getHash(value) : defaultValue;
}
