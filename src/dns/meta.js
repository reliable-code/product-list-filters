const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'DNS List Clean',
    version: `0.1.${getUniqueTimestampSlice()}`,
    match: ['https://www.dns-shop.ru/catalog/*'],
    description: 'Remove product cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=dns-shop.ru',
    ...commonMeta,
};
