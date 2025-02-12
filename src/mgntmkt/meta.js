const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'MagnitMarket product cards filter',
    version: `1.0.${getUniqueTimestampSlice()}`,
    match: ['https://mm.ru/*'],
    description: 'Hide product cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=kazanexpress.ru',
    downloadURL: 'https://raw.githubusercontent.com/reliable-code/product-list-filters/main/dist/mgntmkt.user.js',
    ...commonMeta,
};
