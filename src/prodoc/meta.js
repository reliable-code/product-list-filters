const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'Prodoc enhancer',
    version: `2.0.${getUniqueTimestampSlice()}`,
    match: ['https://prodoctorov.ru/*'],
    description: 'Hide doctor cards by filter, enhance doctor page',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=prodoctorov.ru',
    downloadURL: 'https://raw.githubusercontent.com/reliable-code/product-list-filters/main/dist/prodoc.user.js',
    ...commonMeta,
};
