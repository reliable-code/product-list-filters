import { createButton, createDiv } from '../../dom/factories/elements';
import { arrowUpIcon } from './icons';

export function createSeparator(controlStyle = {}) {
    return createDiv(controlStyle, '|');
}

function createScrollToFiltersButton(
    controlStyle = {}, scrollOffset = 75, filtersContainerId = 'customFiltersContainer',
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
        const rect = filtersContainer.getBoundingClientRect();
        window.scrollTo({
            top: rect.top + window.scrollY - scrollOffset,
        });
    });
    new IntersectionObserver(([entry]) => {
        button.style.display = entry.isIntersecting ? 'none' : 'flex';
    }, {
        threshold: 0.5,
    }).observe(filtersContainer);

    return button;
}

export function addScrollToFiltersButtonBase(parentNode, controlStyle = {}) {
    const button = createScrollToFiltersButton(controlStyle);
    if (button) parentNode.appendChild(button);
}
