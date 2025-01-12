import { clearIntersectionObserver, runOnceOnIntersection } from './utils';

export function insertAfter(existingNode, newNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

export function hideElement(element) {
    element.style.display = 'none';
}

export function saveElementDisplayAndHide(element) {
    saveElementDisplayIfNeeded(element);
    hideElement(element);
}

export function hideElementOnIntersection(element) {
    if (element.intersectionObserver) return;
    runOnceOnIntersection(element, () => hideElement(element));
}

export function showElement(element) {
    element.style.display = '';
}

export function getElementDisplayAndShow(element) {
    const display = getElementDisplay(element);
    element.style.display = display;
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

function getElementDisplay(element) {
    saveElementDisplayIfNeeded(element);

    return element.defaultDisplay;
}

function saveElementDisplayIfNeeded(element) {
    if (element.defaultDisplay) return;

    const { display } = getComputedStyle(element);
    element.defaultDisplay = display;
}

export function initDisplayGroups() {
    return {
        show: [],
        hide: [],
    };
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

export function applyStyles(element, styles) {
    Object.assign(element.style, styles);
}

export function styleObjectToString(styleObject) {
    return Object.entries(styleObject)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1')
            .toLowerCase()}: ${value};`)
        .join(' ');
}

export function styleStringToObject(styleString) {
    if (!styleString) return {};

    return styleString
        .split(';')
        .filter((rule) => rule.trim() !== '')
        .reduce((styleObject, rule) => {
            const [key, value] = rule.split(':')
                .map((item) => item.trim());
            const camelCaseKey = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
            styleObject[camelCaseKey] = value;
            return styleObject;
        }, {});
}
