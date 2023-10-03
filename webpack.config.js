const path = require('path');
const { monkey } = require('webpack-monkey');

module.exports = monkey({
    entry: {
        lavka: './src/lavka/index.js',
        lenta: './src/lenta/index.js',
        ozon: './src/ozon/index.js',
        prodoctorov: './src/prodoctorov/index.js',
        wb: './src/wb/index.js',
        yamarket: './src/yamarket/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
});
