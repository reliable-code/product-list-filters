import { getIncludedSearchStrings } from './helpers';
import { highlightSubstrings } from '../dom/highlighting';

export function highlightSearchStringsByFilter(filter, textWrap) {
    const searchStrings = getIncludedSearchStrings(filter);
    highlightSubstrings(searchStrings, textWrap);
}

export function highlightSearchStringsByFilterMultiple(filter, textWraps) {
    const searchStrings = getIncludedSearchStrings(filter);
    textWraps.forEach((textWrap) => highlightSubstrings(searchStrings, textWrap));
}
