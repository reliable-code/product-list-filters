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

export function getURLQueryStringParam(paramName) {
    const queryString = window.location.search;

    return getQueryStringParam(queryString, paramName);
}

function getQueryStringParam(queryString, paramName) {
    const params = new URLSearchParams(queryString);

    return params.get(paramName);
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

export function getQueryParam(name) {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get(name);
}

export function clearQueryParams(link) {
    return link.split('?')[0];
}
