import { createDiv } from '../dom/factories/elements';
import { getFirstElement } from '../dom/helpers';

export function appendFilterControlsIfNeeded(
    parentNode,
    appendFiltersContainerFunc,
    force = false,
    filtersContainerId = 'customFiltersContainer',
) {
    let filtersContainer = getFirstElement(`#${filtersContainerId}`, parentNode);

    if (filtersContainer) {
        if (force) {
            filtersContainer.remove();
        } else {
            return;
        }
    }

    filtersContainer = createDiv();
    filtersContainer.id = filtersContainerId;

    appendFiltersContainerFunc(filtersContainer, parentNode);
}
