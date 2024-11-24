const path = require('path');
const { monkey } = require('webpack-monkey');
const { EsbuildPlugin } = require('esbuild-loader');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = monkey({
    entry: {
        dns: './src/dns/index.js',
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
