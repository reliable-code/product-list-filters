import { getCurrentDate } from '../dateUtils';

export class ProductData {
    constructor(
        lastCheckDate = getCurrentDate(), lowestPrice = null, highestPrice = null,
    ) {
        this.lastCheckDate = lastCheckDate;
        this.lowestPrice = lowestPrice;
        this.highestPrice = highestPrice;
    }

    get lowestPriceValue() {
        return this.lowestPrice ? this.lowestPrice.value : 0;
    }

    get highestPriceValue() {
        return this.highestPrice ? this.highestPrice.value : 0;
    }

    updateLastCheckDate = () => {
        this.lastCheckDate = getCurrentDate();
    };

    static fromObject(obj) {
        const {
            lastCheckDate,
            lowestPrice,
            highestPrice,
        } = obj;

        return new ProductData(lastCheckDate, lowestPrice, highestPrice);
    }
}
