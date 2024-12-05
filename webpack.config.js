const path = require('path');
const { monkey } = require('webpack-monkey');
const { EsbuildPlugin } = require('esbuild-loader');

const isProduction = process.env.NODE_ENV === 'production';

const entries = [
    'dns',
    'lavka',
    'lenta',
    'mgmkt',
    'mgntmkt',
    'ozon',
    'pepper',
    'prodoctorov',
    'vseins',
    'wb',
    'yamarket',
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
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-transform-runtime'],
                    },
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
