export class DatedValue {
    constructor(value, date = Date.now()) {
        this.value = value;
        this.date = date;
    }
}
