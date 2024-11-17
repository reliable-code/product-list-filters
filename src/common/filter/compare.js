export function isNotMatchTextFilter(parameterValue, filter) {
    return !isMatchTextFilter(parameterValue, filter);
}

function isMatchTextFilter(parameterValue, filter) {
    if (!filter.value) return true;

    const comparedString = parameterValue.toLowerCase();
    const searchStrings = filter.value.toLowerCase()
        .split(',')
        .map((searchString) => searchString.trim());

    const {
        include: includeSearchStrings,
        notInclude: notIncludeSearchStrings,
    } =
        searchStrings.reduce((result, searchString) => {
            if (!searchString.startsWith('!')) {
                result.include.push(searchString);
            } else {
                const notIncludeSearchString = searchString.substring(1);
                if (notIncludeSearchString.length) result.notInclude.push(notIncludeSearchString);
            }
            return result;
        }, {
            include: [],
            notInclude: [],
        });

    return includeSearchStrings.every((searchString) => comparedString.includes(searchString)) &&
        notIncludeSearchStrings.every((searchString) => !comparedString.includes(searchString));
}

export function isLessThanFilter(parameterValue, filter) {
    return filter.value && parameterValue < filter.value;
}

export function isGreaterThanFilter(parameterValue, filter) {
    return filter.value && parameterValue > filter.value;
}
