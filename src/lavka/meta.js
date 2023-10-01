const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'Lavka List Clean',
    version: `0.4.${getUniqueTimestampSlice()}`,
    match: ['https://lavka.yandex.ru/*'],
    description: 'Remove product cards without discount',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=yandex.ru',
    ...commonMeta,
};
