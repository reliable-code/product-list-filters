import { roundToPrecision } from '../mathUtils';

export function getAverageRating(reviews) {
    let totalRating = 0;
    let reviewCount = 0;

    reviews.forEach((review) => {
        totalRating += review.rating;
        reviewCount += 1;
    });

    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

    return roundToPrecision(averageRating);
}
