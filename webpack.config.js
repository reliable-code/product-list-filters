const path = require('path');
const { monkey } = require('webpack-monkey');

module.exports = monkey({
    entry: {
        kazan: './src/kazan/index.js',
        lavka: './src/lavka/index.js',
        lenta: './src/lenta/index.js',
        mm: './src/mm/index.js',
        ozon: './src/ozon/index.js',
        pepper: './src/pepper/index.js',
        prodoctorov: './src/prodoctorov/index.js',
        vseins: './src/vseins/index.js',
        wb: './src/wb/index.js',
        yamarket: './src/yamarket/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
});
