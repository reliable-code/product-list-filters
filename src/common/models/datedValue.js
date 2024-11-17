import { getCurrentDate } from '../dateUtils';

export class DatedValue {
    constructor(value, date = getCurrentDate()) {
        this.value = value;
        this.date = date;
    }
}
