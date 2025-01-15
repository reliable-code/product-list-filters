const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'MegaMarket product cards & offers filter',
    version: `1.0.${getUniqueTimestampSlice()}`,
    match: ['https://megamarket.ru/*'],
    description: 'Hide product cards & offers by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=megamarket.ru',
    ...commonMeta,
};
