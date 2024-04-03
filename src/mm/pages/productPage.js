import {
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
    hideElement,
    showHideElement,
} from '../../common/dom';

export function initOffersClean() {
    const offersSection = getFirstElement('.pdp-prices');

    if (offersSection) {
        cleanOffers();
    }
}

function cleanOffers() {
    const offers = getAllElements('.pdp-prices .product-offer');

    offers.forEach(
        (offer) => {
            const priceWrap =
                getFirstElement('.product-offer-price__amount', offer);

            const cashbackWrap =
                getFirstElement('.bonus-percent', offer);

            if (!priceWrap || !cashbackWrap) {
                hideElement(offer);

                return;
            }

            const priceNumber = getElementInnerNumber(priceWrap, true);
            const cashbackNumber = getElementInnerNumber(cashbackWrap, true);

            const conditionToHide =
                cashbackNumber < 10;
            showHideElement(offer, conditionToHide, 'flex');
        },
    );
}
