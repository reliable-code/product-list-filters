export class ProductData {
    constructor(
        lastCheckDate = new Date().toLocaleDateString(), lowestPrice = 0, highestPrice = 0,
    ) {
        this.lastCheckDate = lastCheckDate;
        this.lowestPrice = lowestPrice;
        this.highestPrice = highestPrice;
    }

    // todo: extract new date to utils
    updateLastCheckDate = () => {
        this.lastCheckDate = new Date().toLocaleDateString();
    };
}
