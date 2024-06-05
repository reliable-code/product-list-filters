const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'Kazan List Clean',
    version: `0.1.${getUniqueTimestampSlice()}`,
    match: ['https://mm.ru/*'],
    description: 'Remove product cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=kazanexpress.ru',
    ...commonMeta,
};
