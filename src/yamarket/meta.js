const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'Yamarket product cards filter',
    version: `0.5.${getUniqueTimestampSlice()}`,
    match: ['https://market.yandex.ru/*'],
    description: 'Hide product cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=market.yandex.ru',
    ...commonMeta,
};
