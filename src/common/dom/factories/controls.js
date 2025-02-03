import { createActionLink, createActionLinkWithIcon, createDiv } from './elements';

function createControl(element, controlStyles = {}) {
    const control = createDiv(controlStyles);
    control.append(element);
    return control;
}
