export function insertAfter(existingNode, newNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

export function hideElement(element) {
    setElementDisplayAttributeIfNeeded(element);
    setElementDisplay(element, 'none');
}

export function showElement(element, display) {
    display = display || getElementDisplay(element);
    setElementDisplay(element, display);
}

export function showHideElement(element, conditionToHide, display) {
    if (conditionToHide) {
        hideElement(element);
    } else {
        display = display || getElementDisplay(element);
        showElement(element, display);
    }
}

function setElementDisplay(element, display) {
    element.style.display = display;
}

function getElementDisplay(element) {
    setElementDisplayAttributeIfNeeded(element);

    return element.getAttribute('display');
}

function setElementDisplayAttributeIfNeeded(element) {
    if (element.hasAttribute('display')) return;

    const { display } = getComputedStyle(element);
    element.setAttribute('display', display);
}

export function defineElementOpacity(element, conditionToDefine, opacity = 0.2) {
    if (conditionToDefine) {
        setElementOpacity(element, opacity);
    } else {
        resetElementOpacity(element);
    }
}

export function resetElementOpacity(element) {
    element.style.opacity = '';
}

export function setElementOpacity(element, opacity = 0.2) {
    element.style.opacity = opacity;
}

export function resetElementOrder(element) {
    element.style.order = '';
}

export function setElementOrder(element, order) {
    element.style.order = order;
}

export function setElementBackground(element, background) {
    element.style.background = background;
}

export function addGlobalStyle(css) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = css;
    document.head.appendChild(style);
}
