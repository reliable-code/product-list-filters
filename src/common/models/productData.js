export class ProductData {
    constructor(
        lastCheckDate = Date.now(),
        lowestPrice = null,
        highestPrice = null,
        priceHistory = {},
    ) {
        this.lastCheckDate = lastCheckDate;
        this.lowestPrice = lowestPrice;
        this.highestPrice = highestPrice;
        this.priceHistory = priceHistory;
    }

    get lowestPriceValue() {
        return this.lowestPrice ? this.lowestPrice.value : 0;
    }

    get highestPriceValue() {
        return this.highestPrice ? this.highestPrice.value : 0;
    }

    updateLastCheckDate = () => {
        this.lastCheckDate = Date.now();
    };

    static fromObject(obj) {
        const {
            lastCheckDate,
            lowestPrice,
            highestPrice,
            priceHistory,
        } = obj;

        return new ProductData(lastCheckDate, lowestPrice, highestPrice, priceHistory);
    }
}
