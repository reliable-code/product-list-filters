const path = require('path');
const { monkey } = require('webpack-monkey');
const { EsbuildPlugin } = require('esbuild-loader');

const isProduction = process.env.NODE_ENV === 'production';

const entries = [
    'dns',
    'habr',
    'kinop',
    'lavka',
    'lenta',
    'mgmkt',
    'mgntmkt',
    'ozon',
    'pepper',
    'prodoc',
    'vseins',
    'wb',
    'yamkt',
];

module.exports = monkey({
    entry: Object.fromEntries(
        entries.map((key) => [key, `./src/${key}/index.js`]),
    ),
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'eval-source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'esbuild-loader',
                options: {
                    target: 'es2022',
                },
            },
        ],
    },
    optimization: {
        minimize: isProduction,
        minimizer: [
            new EsbuildPlugin({
                target: 'es2022',
                minify: true,
                legalComments: 'none',
            }),
        ],
        usedExports: true,
    },
});
