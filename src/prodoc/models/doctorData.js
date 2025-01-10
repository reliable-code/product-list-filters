export class DoctorData {
    constructor(
        lastCheckDate = Date.now(),
        reviewsData = [],
    ) {
        this.lastCheckDate = lastCheckDate;
        this.reviewsData = reviewsData;
    }

    updateLastCheckDate = () => {
        this.lastCheckDate = Date.now();
    };

    static fromObject(obj) {
        const {
            lastCheckDate,
            reviewsData,
        } = obj;

        return new DoctorData(lastCheckDate, reviewsData);
    }
}
