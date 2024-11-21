import { getDateTimestamp } from '../dateUtils';

export class DatedValue {
    constructor(value, date = getDateTimestamp()) {
        this.value = value;
        this.date = date;
    }
}
