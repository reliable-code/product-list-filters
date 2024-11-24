export function getDateTimestamp() {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of the day
    return now.getTime();
}

export function getLocalDateFromTimestamp(timestamp) {
    return new Date(timestamp).toLocaleDateString();
}

export function getDateMonthsAgo(months) {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date;
}
