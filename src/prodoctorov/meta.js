const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'Prodoctorov List Clean',
    version: `0.6.${getUniqueTimestampSlice()}`,
    match: ['https://prodoctorov.ru/*'],
    description: 'Remove profile cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=prodoctorov.ru',
    ...commonMeta,
};
