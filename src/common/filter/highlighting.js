import { getIncludedSearchStrings } from './helpers';
import { highlightSearchStrings } from '../dom/highlighting';

export function highlightSearchStringsByFilter(filter, textWrap) {
    const searchStrings = getIncludedSearchStrings(filter);
    highlightSearchStrings(searchStrings, textWrap);
}
