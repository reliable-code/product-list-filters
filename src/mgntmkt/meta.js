const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'MagnitMarket product cards filter',
    version: `0.1.${getUniqueTimestampSlice()}`,
    match: ['https://mm.ru/*'],
    description: 'Hide product cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=kazanexpress.ru',
    ...commonMeta,
};
