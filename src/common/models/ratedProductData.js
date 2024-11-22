import { ProductData } from './productData';

export class RatedProductData extends ProductData {
    constructor(
        lastCheckDate = Date.now(),
        lowestPrice = null,
        highestPrice = null,
        priceHistory = {},
        rating = null,
    ) {
        super(lastCheckDate, lowestPrice, highestPrice, priceHistory);
        this.rating = rating;
    }

    static fromObject(obj) {
        const {
            lastCheckDate,
            lowestPrice,
            highestPrice,
            priceHistory,
            rating,
        } = obj;

        return new RatedProductData(lastCheckDate, lowestPrice, highestPrice, priceHistory, rating);
    }
}
