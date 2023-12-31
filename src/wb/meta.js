const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'WB List Clean',
    version: `0.7.${getUniqueTimestampSlice()}`,
    match: ['https://www.wildberries.ru/*'],
    description: 'Remove product cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=wildberries.ru',
    ...commonMeta,
};
