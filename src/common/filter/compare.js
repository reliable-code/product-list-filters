export function isNotMatchTextFilter(parameterValue, filter) {
    return !isMatchTextFilter(parameterValue, filter);
}

function isMatchTextFilter(parameterValue, filter) {
    if (!filter.value) return true;

    const comparedString = parameterValue.toLowerCase();
    const searchStrings = getSearchStrings(filter);

    const includeSearchStrings = [];
    const notIncludeSearchStrings = [];

    searchStrings.forEach((searchString) => {
        if (searchString.startsWith('!')) {
            const notIncludeSearchString = searchString.substring(1);
            if (notIncludeSearchString) notIncludeSearchStrings.push(notIncludeSearchString);
        } else {
            includeSearchStrings.push(searchString);
        }
    });

    return includeSearchStrings.every((searchString) => comparedString.includes(searchString)) &&
        notIncludeSearchStrings.every((searchString) => !comparedString.includes(searchString));
}

function getSearchStrings(filter) {
    return filter.value.toLowerCase()
        .split(',')
        .map((searchString) => searchString.trim())
        .filter((searchString) => searchString !== '');
}

export function getIncludedSearchStrings(filter) {
    return getSearchStrings(filter)
        .filter((searchString) => !searchString.startsWith('!'));
}

export function isLessThanFilter(parameterValue, filter) {
    return filter.value != null && parameterValue < filter.value;
}

export function isGreaterThanFilter(parameterValue, filter) {
    return filter.value != null && parameterValue > filter.value;
}
