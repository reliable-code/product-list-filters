const { getUniqueTimestampSlice } = require('../common/utils');
const commonMeta = require('../common/meta');

module.exports = {
    name: 'Kinopoisk navigator filter',
    version: `0.1.${getUniqueTimestampSlice()}`,
    match: ['https://www.kinopoisk.ru/top/navigator/*'],
    description: 'Hide movies by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=dns-shop.ru',
    ...commonMeta,
};
