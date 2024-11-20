import { getCurrentDate } from '../dateUtils';
import { ProductData } from './productData';

export class RatedProductData extends ProductData {
    constructor(
        lastCheckDate = getCurrentDate(),
        lowestPrice = null,
        highestPrice = null,
        rating = null,
    ) {
        super(lastCheckDate, lowestPrice, highestPrice);
        this.rating = rating;
    }
}
