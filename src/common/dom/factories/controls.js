import { createActionLink, createActionLinkWithIcon, createDiv } from './elements';

function createControl(element, controlStyles = {}, labelText = null) {
    const control = createDiv(controlStyles, labelText);
    control.append(element);
    return control;
}

export function createActionLinkControl(
    onClick,
    linkText = null,
    controlStyles = {},
    linkStyles = {},
) {
    const link = createActionLink(onClick, linkText, linkStyles);
    return createControl(link, controlStyles);
}

export function createActionLinkWithIconControl(
    onClick,
    linkText = null,
    iconName = null,
    controlStyles = {},
    linkStyles = {},
) {
    const link = createActionLinkWithIcon(onClick, iconName, linkText, linkStyles);
    return createControl(link, controlStyles);
}
