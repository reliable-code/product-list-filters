const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'Ozon enhancer',
    version: `3.1.${getUniqueTimestampSlice()}`,
    match: ['https://www.ozon.ru/*'],
    description: 'Hide product cards by filter, enhance product page, store price history & rating',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=ozon.ru',
    downloadURL: 'https://raw.githubusercontent.com/reliable-code/product-list-filters/main/dist/ozon.user.js',
    ...commonMeta,
};
