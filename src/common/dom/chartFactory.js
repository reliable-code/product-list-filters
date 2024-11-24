import Chart from 'chart.js/auto';
import { createDiv } from './elementsFactory';

export function createChart(type, chartData, chartOptions, containerStyles = {}) {
    const chartContainer = createDiv(containerStyles);

    const ctx = document.createElement('canvas');
    ctx.style.width = '100%';
    chartContainer.appendChild(ctx);

    // eslint-disable-next-line no-new
    new Chart(ctx, {
        type,
        data: chartData,
        options: chartOptions,
    });

    return chartContainer;
}
