const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'Megamarket List Clean',
    version: `0.1.${getUniqueTimestampSlice()}`,
    match: ['https://megamarket.ru/*'],
    description: 'Remove product cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=megamarket.ru',
    ...commonMeta,
};
