const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'Ozon enhancer',
    version: `2.0.${getUniqueTimestampSlice()}`,
    match: ['https://www.ozon.ru/*'],
    description: 'Hide product cards by filter, enhance product page, store price history & rating',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=ozon.ru',
    ...commonMeta,
};
