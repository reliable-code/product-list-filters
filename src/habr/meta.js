const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'Habr comments filter',
    version: `1.0.${getUniqueTimestampSlice()}`,
    match: ['https://habr.com/*'],
    description: 'Hide comments by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=habr.com',
    downloadURL: 'https://raw.githubusercontent.com/reliable-code/product-list-filters/main/dist/habr.user.js',
    ...commonMeta,
};
