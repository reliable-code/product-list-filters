export function getURLPathElement(position, defaultValue = 'common', logResult = false) {
    const { pathname } = window.location;

    return getPathnameElement(pathname, position, defaultValue, logResult);
}

export function getPathnameElement(pathname, position, defaultValue, logResult = false) {
    const pathElements = pathname.split('/');

    const pathElement = pathElements[position] || defaultValue;

    if (logResult) console.log(`Pathname element: ${pathElement}`);

    return pathElement;
}

export function getURLPathElementEnding(position, defaultValue = 'common', logResult = false) {
    const pathElement = getURLPathElement(position, '', logResult);

    return getPathElementEnding(pathElement, defaultValue, logResult);
}

function getPathElementEnding(pathElement, defaultValue, logResult) {
    if (!pathElement) return defaultValue;

    const pathElementEnding = pathElement.split('-')
        .at(-1);

    if (logResult) console.log(`Pathname element ending: ${pathElementEnding}`);

    return pathElementEnding;
}

export function getPathnameElementEnding(pathname, position, defaultValue = 'common', logResult = false) {
    const pathElement = getPathnameElement(pathname, position, '', logResult);

    return getPathElementEnding(pathElement, defaultValue, logResult);
}

export function getURLQueryParam(name) {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get(name);
}

export function clearQueryParams(link) {
    return link.split('?')[0];
}

export function pathnameIncludes(searchString) {
    return window.location.pathname.includes(searchString);
}

export function pathnameIncludesSome(searchStrings) {
    return searchStrings.some((searchString) => pathnameIncludes(searchString));
}

export function somePathElementEquals(searchString) {
    const pathElements = window.location.pathname.split('/');

    return pathElements.some((pathElement) => pathElement === searchString);
}

export function setQueryParamsAndRedirect(queryParams) {
    try {
        const url = new URL(window.location.href);
        Object.entries(queryParams)
            .forEach(([key, value]) => {
                url.searchParams.set(key, value);
            });
        window.location.href = url.toString();
    } catch (error) {
        console.error('Failed to redirect:', error);
    }
}

export function interceptHistoryMethod(method, callback) {
    return function (...args) {
        method.apply(this, args);
        callback();
    };
}
