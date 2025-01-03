export function getSearchStrings(filter) {
    return filter.value.toLowerCase()
        .split(',')
        .map((searchString) => searchString.trim())
        .filter((searchString) => searchString !== '');
}

export function getIncludedSearchStrings(filter) {
    return getSearchStrings(filter)
        .filter((searchString) => !searchString.startsWith('!'));
}
