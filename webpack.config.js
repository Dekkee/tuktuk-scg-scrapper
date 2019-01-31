const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const OfflinePlugin = require('offline-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const PreloadWebpackPlugin = require('preload-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');

const webpack = require('webpack');
const path = require('path');
const manifest = require('./src/pwa/manifest');

const externals = [
    {
        module: 'react',
        entry: `https://unpkg.com/react@${require('./package').dependencies.react}/umd/react.production.min.js`,
        global: 'React',
    },
    {
        module: 'react-dom',
        entry: `https://unpkg.com/react-dom@${require('./package').dependencies['react-dom']}/umd/react-dom.production.min.js`,
        global: 'ReactDOM',
    },
];

const vendors = [
    {
        entry: 'icomoon.woff2',
    },
    {
        entry: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
    },
];

module.exports = (env) => {
    const isProd = env === 'production';

    const plugins = [
        new CleanWebpackPlugin(['dist']),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env)
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            favicon: './src/icons/favicon.ico',
            template: path.join('./src/template/index.html'),
            title: manifest.name,
            meta: {
                viewport: 'width=device-width, initial-scale=1',
                author: manifest.author,
                charset: 'utf-8',
                description: manifest.description,
            }
        })
    ];
    if (isProd) {
        plugins.push(
            new WebpackPwaManifest(manifest),
            new HtmlWebpackExternalsPlugin({ externals }),
            new MiniCssExtractPlugin(),
            new OfflinePlugin({
                ServiceWorker: {
                    events: true
                },
                externals: [...vendors.map(value => value.entry), ...externals.map(value => value.entry)]
            }),
            new PreloadWebpackPlugin({
                rel: 'preload',
                include: 'allChunks' // or 'initial'
            }),
        );
    }
    if (!isProd) {
        plugins.push(new webpack.HotModuleReplacementPlugin());
    }

    return {
        entry: './src/index.tsx',
        mode: env || 'development',
        module: {
            rules: [
                {
                    test: /\.tsx?/,
                    use: 'awesome-typescript-loader'
                },
                {
                    test: /\.scss$/,
                    use: [
                        isProd ? MiniCssExtractPlugin.loader : 'style-loader', // creates style nodes from JS strings
                        'css-loader', // translates CSS into CommonJS
                        'sass-loader' // compiles Sass to CSS
                    ]
                },
                {
                    test: /\.jpe?g$|\.gif$|\.svg$|\.woff$|\.woff2$|\.ttf$|\.wav$|\.mp3$/,
                    loader: 'file-loader?name=[name].[ext]'
                }
            ]
        },
        plugins,
        resolve: {
            extensions: ['.js', '.ts', '.tsx']
        },
        devServer: {
            compress: true,
            contentBase: './dist',
            hot: true,
            historyApiFallback: true,
        },
        devtool: isProd && 'cheap-source-map',
        externals: isProd ? {
            ...externals.reduce((previousValue, currentValue) => ({
                ...previousValue,
                [currentValue.module]: currentValue.global
            }), {})
        } : {},
        output: {
            path: path.resolve(__dirname, '..', 'dist'),
            publicPath: '/',
        },
        optimization: isProd ? {
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true // set to true if you want JS source maps
                }),
                new OptimizeCSSAssetsPlugin({})
            ]
        } : {},
    }
};
