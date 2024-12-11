/* eslint-disable no-bitwise */

// FNV-1a hash function (32-bit version)
function fnv1aHash32(input) {
    const FNV_OFFSET_BASIS = 2166136261; // Initial FNV-1a hash value (32-bit)
    const FNV_PRIME = 16777619; // The prime multiplier for the hash function

    let hash = FNV_OFFSET_BASIS;

    for (let i = 0; i < input.length; i += 1) {
        const charCode = input.charCodeAt(i); // Get the character code
        hash ^= charCode; // XOR the hash with the character code
        hash = Math.imul(hash, FNV_PRIME); // Multiply by the FNV prime
    }

    // Constrain hash to 32 bits
    return (hash >>> 0);
}

export function getHash(value) {
    // Convert to hex, and ensure it has 8 characters
    return fnv1aHash32(value)
        .toString(16)
        .padStart(8, '0');
}

export function getHashOrDefault(value, defaultValue = 'common') {
    return value ? getHash(value) : defaultValue;
}
