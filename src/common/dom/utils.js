export async function waitForElement(parentNode, selector, timeout = null) {
    const existingElement = parentNode.querySelector(selector);
    if (existingElement) return existingElement;

    return new Promise((resolve) => {
        const observer = new MutationObserver(mutationCallback);

        observer.observe(parentNode, {
            childList: true,
            subtree: true,
        });

        let timeoutId = null;
        if (timeout) {
            timeoutId = setTimeout(() => {
                observer.disconnect();
                console.log(`No element found for selector: ${selector}`);
                resolve(null);
            }, timeout);
        }

        function mutationCallback() {
            const element = parentNode.querySelector(selector);
            if (!element) return;

            if (timeoutId) clearTimeout(timeoutId);
            observer.disconnect();
            resolve(element);
        }
    });
}

export function debounce(func, wait = 250) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), wait);
    };
}

export function runOnceOnIntersection(element, callback) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            callback();
            clearIntersectionObserver(element);
        });
    });

    element.intersectionObserver = observer;
    observer.observe(element);
}

export function clearIntersectionObserver(element) {
    if (!element.intersectionObserver) return;

    element.intersectionObserver.disconnect();
    element.intersectionObserver = null;
}
