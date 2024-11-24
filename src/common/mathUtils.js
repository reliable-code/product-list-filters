export function getMedian(values) {
    const sortedValues = values.slice()
        .sort((a, b) => a - b);
    const midIndex = Math.floor(sortedValues.length / 2);

    if (sortedValues.length % 2 !== 0) {
        return sortedValues[midIndex];
    }

    return (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2;
}

export function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}
