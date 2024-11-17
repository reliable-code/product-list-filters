export class DatedValue {
    constructor(value, date = new Date().toLocaleDateString()) {
        this.value = value;
        this.date = date;
    }
}
