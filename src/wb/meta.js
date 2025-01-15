const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'WB enhancer',
    version: `2.0.${getUniqueTimestampSlice()}`,
    match: ['https://www.wildberries.ru/*'],
    description: 'Hide product cards by filter, store price history',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=wildberries.ru',
    ...commonMeta,
};
