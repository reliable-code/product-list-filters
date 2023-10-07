const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'Lenta List Clean',
    version: `0.3.${getUniqueTimestampSlice()}`,
    match: ['https://*.online.lenta.com/*'],
    description: 'Remove product cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=lenta.com',
    ...commonMeta,
};
