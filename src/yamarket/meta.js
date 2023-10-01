const commonMeta = require('../common/meta');

module.exports = {
    name: 'Yamarket List Clean',
    version: '0.3.1',
    match: ['https://market.yandex.ru/*'],
    description: 'Remove product cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=market.yandex.ru',
    ...commonMeta,
};
