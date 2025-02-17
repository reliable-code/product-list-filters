import { clearIntersectionObserver, runOnceOnIntersection } from './utils';
import { getURLQueryParam } from '../url';
import { createLink } from './factories/elements';
import { getFirstElement } from './helpers';

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

export function assignElementToDisplayGroup(shouldHide, displayGroups, element) {
    if (shouldHide) {
        displayGroups.hide.push(element);
    } else {
        displayGroups.show.push(element);
    }
}

export function handleDisplayGroups(displayGroups) {
    displayGroups.show.forEach(showElement);
    displayGroups.hide.forEach(hideElement);
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

export function wrapFirstElementWithLink(href, selector) {
    const element = getFirstElement(selector);
    if (!element) return;

    const link = createLink();
    link.href = href;

    element.parentNode.append(link);
    link.append(element);
}

export function wrapFirstElementContentWithLink(href, selector) {
    const element = getFirstElement(selector);
    if (!element) return;
    wrapElementContentWithLink(href, element);
}

export function wrapElementContentWithLink(href, element) {
    const link = createLink();
    link.href = href;
    link.append(...element.childNodes);
    element.append(link);
}

export function scrollToElementFromQueryParam() {
    const elementId = getURLQueryParam('scrollTo');
    if (!elementId) return;

    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView();
    } else {
        console.log(`Element with ID "${elementId}" was not found.`);
    }
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

export function saveToFile(content, filename, fileType = 'text/plain') {
    const blob = new Blob([content], { type: fileType });
    const objectURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    requestAnimationFrame(() => URL.revokeObjectURL(objectURL));
}
