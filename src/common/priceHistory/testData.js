import { getRandomFloat } from '../mathUtils';

export function generateTestData(count, currentValue) {
    const data = {};
    const msInDay = 1000 * 60 * 60 * 24; // Number of milliseconds in one day
    const startDate = Date.now() - ((count - 1) * msInDay); // Calculate the starting date

    for (let i = 0; i < count; i += 1) {
        const timestamp = startDate + (i * msInDay); // Generate timestamps for each day
        const baseVariation = getRandomFloat(0.6, 1.1); // Random multiplier
        const highestOffset = getRandomFloat(0, 0.3); // Random offset for "highest"
        const highestVariation = baseVariation + highestOffset;
        const lowest = Math.floor(currentValue * baseVariation); // Generate "lowest" price
        const highest = Math.floor(currentValue * highestVariation); // Generate "highest" price

        data[timestamp] = {
            lowest,
            highest,
        };
    }

    return data;
}
