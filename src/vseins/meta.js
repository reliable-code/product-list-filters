const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'Vseins product cards filter',
    version: `0.1.${getUniqueTimestampSlice()}`,
    match: ['https://www.vseinstrumenti.ru/tag-page/*', 'https://www.vseinstrumenti.ru/category/*'],
    description: 'Hide product cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=vseinstrumenti.ru',
    ...commonMeta,
};
