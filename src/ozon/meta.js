const commonMeta = require('../common/meta');

module.exports = {
    name: 'Ozon List Clean',
    version: '0.6.2',
    match: ['https://www.ozon.ru/*'],
    description: 'Remove product cards by filter',
    icon: 'https://www.google.com/s2/favicons?sz=64&domain=ozon.ru',
    ...commonMeta,
};
