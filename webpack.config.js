const path = require('path');
const { monkey } = require('webpack-monkey');

module.exports = monkey({
    entry: './src/ozon/index.js',
    output: {
        filename: 'ozon.user.js',
        path: path.resolve(__dirname, 'dist'),
    },
});
