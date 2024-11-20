import { ProductData } from './productData';

export class RatedProductData extends ProductData {
    constructor(
        lastCheckDate = Date.now(),
        lowestPrice = null,
        highestPrice = null,
        rating = null,
    ) {
        super(lastCheckDate, lowestPrice, highestPrice);
        this.rating = rating;
    }

    static fromObject(obj) {
        const {
            lastCheckDate,
            lowestPrice,
            highestPrice,
            rating,
        } = obj;

        return new RatedProductData(lastCheckDate, lowestPrice, highestPrice, rating);
    }
}
