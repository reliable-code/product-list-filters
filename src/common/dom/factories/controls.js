import { createActionLink, createActionLinkWithIcon, createDiv } from './elements';

function createControl(element, controlStyles = {}, labelText = null) {
    const control = createDiv(controlStyles, labelText);
    control.append(element);
    return control;
}

export function createActionLinkControl(
    onClick,
    innerHTML = null,
    controlStyles = {},
    linkStyles = {},
) {
    const link = createActionLink(onClick, innerHTML, linkStyles);
    return createControl(link, controlStyles);
}

export function createActionLinkWithIconControl(
    onClick,
    innerHTML = null,
    iconName = null,
    controlStyles = {},
    linkStyles = {},
) {
    const link = createActionLinkWithIcon(onClick, iconName, innerHTML, linkStyles);
    return createControl(link, controlStyles);
}
