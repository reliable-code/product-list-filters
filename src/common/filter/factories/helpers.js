import { createButton, createDiv } from '../../dom/factories/elements';
import { arrowUpIcon } from './icons';

export function createSeparator(controlStyle = {}) {
    return createDiv(controlStyle, '|');
}

export function createScrollToFiltersButton(
    controlStyle = {}, filtersContainerId = 'customFiltersContainer',
) {
    const filtersContainer = document.getElementById(filtersContainerId);
    if (!filtersContainer) {
        console.log(`Element with id="${filtersContainerId}" not found.`);
        return null;
    }

    const button = createButton(controlStyle, `${arrowUpIcon}К фильтрам`);
    button.addEventListener('mouseover', () => {
        button.style.filter = 'brightness(0.9)';
    });
    button.addEventListener('mouseout', () => {
        button.style.filter = 'brightness(1)';
    });
    button.addEventListener('click', () => {
        window.scrollTo({
            top: filtersContainer.offsetTop - 75,
        });
    });
    new IntersectionObserver(([entry]) => {
        button.style.display = entry.isIntersecting ? 'none' : 'flex';
    }, {
        threshold: 1,
    }).observe(filtersContainer);

    return button;
}
