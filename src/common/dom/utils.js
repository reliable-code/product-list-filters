export function waitForElement(parentNode, selector, timeout = null) {
    return new Promise((resolve) => {
        const existingElement = parentNode.querySelector(selector);

        if (existingElement) {
            resolve(existingElement);
            return;
        }

        const observer = new MutationObserver(mutationCallback);

        observer.observe(parentNode, {
            childList: true,
            subtree: true,
        });

        let timeoutId = null;
        if (timeout) {
            timeoutId = setTimeout(
                () => {
                    observer.disconnect();
                    console.log(`No element found for selector: ${selector}`);
                    resolve(null);
                },
                timeout,
            );
        }

        function mutationCallback() {
            if (parentNode.querySelector(selector)) {
                if (timeoutId) clearTimeout(timeoutId);
                observer.disconnect();
                resolve(parentNode.querySelector(selector));
            }
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
