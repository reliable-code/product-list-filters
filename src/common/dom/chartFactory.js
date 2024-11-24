// eslint-disable-next-line import/no-extraneous-dependencies
import Chart from 'chart.js/auto';
import { createDiv } from './elementsFactory';

export function createChart(containerStyles, type, chartData, chartOptions) {
    const chartContainer = createDiv(containerStyles);

    const ctx = document.createElement('canvas');
    chartContainer.appendChild(ctx);

    // eslint-disable-next-line no-new
    new Chart(ctx, {
        type,
        data: chartData,
        options: chartOptions,
    });

    return chartContainer;
}
