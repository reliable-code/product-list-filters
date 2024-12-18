export function insertAfter(existingNode, newNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

export function hideElement(element) {
    setElementDisplayAttributeIfNeeded(element);
    setElementDisplay(element, 'none');
}

export function showElement(element, display) {
    const resolvedDisplay = display || getElementDisplay(element);
    setElementDisplay(element, resolvedDisplay);
}

export function updateElementDisplay(element, shouldHide, display) {
    if (shouldHide) {
        hideElement(element);
    } else {
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

export function updateElementOpacity(element, shouldSetOpacity, opacity = 0.3) {
    if (shouldSetOpacity) {
        setElementOpacity(element, opacity);
    } else {
        resetElementOpacity(element);
    }
}

export function resetElementOpacity(element) {
    element.style.opacity = '';
}

export function setElementOpacity(element, opacity = 0.3) {
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

export function addGlobalStyle(css, id = 'custom-global-style') {
    let style = document.getElementById(id);

    if (!style) {
        style = document.createElement('style');
        style.id = id;
        style.type = 'text/css';
        document.head.appendChild(style);
    }

    style.textContent = css;
}
