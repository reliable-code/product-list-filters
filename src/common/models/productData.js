export class ProductData {
    constructor(
        lastCheckDate = new Date().toLocaleDateString(), lowestPrice = null, highestPrice = null,
    ) {
        this.lastCheckDate = lastCheckDate;
        this.lowestPrice = lowestPrice;
        this.highestPrice = highestPrice;
    }
}
