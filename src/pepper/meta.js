const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'Pepper List Clean',
    version: `0.3.${getUniqueTimestampSlice()}`,
    match: ['https://www.pepper.ru/*'],
    description: 'Remove product cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=pepper.ru',
    ...commonMeta,
};
