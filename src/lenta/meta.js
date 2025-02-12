const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'Lenta List Clean',
    version: `1.0.${getUniqueTimestampSlice()}`,
    match: ['https://*.lenta.com/*'],
    description: 'Remove product cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=lenta.com',
    downloadURL: 'https://raw.githubusercontent.com/reliable-code/product-list-filters/main/dist/lenta.user.js',
    ...commonMeta,
};
