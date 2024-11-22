export function getDeviationColor(oldValue, currentValue, maxDeviationPercentage = 50) {
    // Calculate the percentage deviation
    const deviationPercentage = ((Math.abs(oldValue - currentValue) / oldValue) * 100);

    // Calculate the alpha channel: the greater the deviation, the more opaque the color
    const alpha = Math.min(1, Math.max(0, deviationPercentage / maxDeviationPercentage));

    // If the old value is greater than the current value, use a red hue (0)
    // If the old value is less than or equal to the current value, use a green hue (90)
    const hue = oldValue > currentValue ? 0 : 90; // 0 - red, 90 - green

    // Fixed saturation and lightness values for color
    const saturation = 100; // Full saturation
    const lightness = 35; // Darker shade for better visibility

    // Return the HSLA color with the calculated alpha value
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}
