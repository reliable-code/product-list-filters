const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'DNS product cards filter',
    version: `1.0.${getUniqueTimestampSlice()}`,
    match: ['https://www.dns-shop.ru/catalog/*'],
    description: 'Hide product cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=dns-shop.ru',
    downloadURL: 'https://raw.githubusercontent.com/reliable-code/product-list-filters/main/dist/dns.user.js',
    ...commonMeta,
};
