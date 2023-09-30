const path = require('path');
const { monkey } = require('webpack-monkey');

module.exports = monkey({
    entry: {
        ozon: './src/ozon/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
});
