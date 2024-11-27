import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import { createDiv } from './elements';

Chart.register(annotationPlugin);

export function createChart(type, chartData, chartOptions, containerStyles = {}) {
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
