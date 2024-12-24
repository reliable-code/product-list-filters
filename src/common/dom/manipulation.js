import { clearIntersectionObserver, runOnceOnIntersection } from './utils';

export function insertAfter(existingNode, newNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

export function hideElement(element) {
    setElementDisplayAttributeIfNeeded(element);
    setElementDisplay(element, 'none');
}

export function hideElementOnIntersection(element) {
    if (element.intersectionObserver) return;
    runOnceOnIntersection(element, () => hideElement(element));
}

export function showElement(element) {
    const display = getElementDisplay(element);
    setElementDisplay(element, display);
}

export function updateElementDisplay(element, shouldHide) {
    if (shouldHide) {
        hideElement(element);
    } else {
        showElement(element);
    }
}

export function updateElementDisplayByIntersection(element, shouldHide) {
    if (shouldHide) {
        hideElementOnIntersection(element);
    } else {
        clearIntersectionObserver(element);
        showElement(element);
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
