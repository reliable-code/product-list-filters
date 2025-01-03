import { getIncludedSearchStrings } from './helpers';
import { highlightSearchStrings } from '../dom/highlighting';

export function highlightSearchStringsByFilter(filter, textWrap) {
    const searchStrings = getIncludedSearchStrings(filter);
    highlightSearchStrings(searchStrings, textWrap);
}

export function highlightSearchStringsByFilterMultiple(filter, textWraps) {
    const searchStrings = getIncludedSearchStrings(filter);
    textWraps.forEach((textWrap) => highlightSearchStrings(searchStrings, textWrap));
}
