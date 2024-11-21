export function getDateTimestamp() {
    const timestamp = Date.now();
    const msInDay = 86400000;
    return timestamp - (timestamp % msInDay);
}

export function getLocalDateFromTimestamp(timestamp) {
    return new Date(timestamp).toLocaleDateString();
}
