import { createButton, createDiv } from '../../dom/factories/elements';
import { arrowUpIcon } from './icons';

export function createSeparator(controlStyle = {}) {
    return createDiv(controlStyle, '|');
}

export function createScrollToFiltersButton(
    controlStyle = {}, filtersContainerId = 'customFiltersContainer',
) {
    const button = createButton(controlStyle, `${arrowUpIcon}К фильтрам`);
    button.addEventListener('mouseover', () => {
        button.style.filter = 'brightness(0.9)';
    });
    button.addEventListener('mouseout', () => {
        button.style.filter = 'brightness(1)';
    });
    button.addEventListener('click', () => {
        const filtersContainer = document.getElementById(filtersContainerId);
        if (filtersContainer) {
            window.scrollTo({
                top: filtersContainer.offsetTop - 75,
            });
        } else {
            console.error(`Element with id="${filtersContainerId}" not found.`);
        }
    });

    return button;
}
