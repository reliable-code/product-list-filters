const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'Ozon List Clean',
    version: `1.0.${getUniqueTimestampSlice()}`,
    match: ['https://www.ozon.ru/*'],
    description: 'Remove product cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=ozon.ru',
    ...commonMeta,
};
