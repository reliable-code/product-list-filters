import { getIncludedSearchStrings } from './helpers';
import { highlightSearchStrings } from '../dom/highlighting';

export function highlightSearchStringsByFilter(textWrap, filter) {
    const searchStrings = getIncludedSearchStrings(filter);
    highlightSearchStrings(searchStrings, textWrap);
}
