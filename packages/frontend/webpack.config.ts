import { DefinePlugin, Configuration as WebpackConfiguration, ProvidePlugin, WebpackOptionsNormalized } from "webpack";

const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
// const OfflinePlugin = require('offline-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PreloadWebpackPlugin = require('preload-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
const { config } = require('@tuktuk-scg-scrapper/common/config/frontend');
const path = require('path');
const manifest = require('./src/pwa/manifest');

const getVersion = (versionString) => (versionString.match(/(\d+?(\.\d+)?(\.\d+))/) || [])[1];

const externals = [{
    module: 'react',
    entry: `https://unpkg.com/react@${getVersion(require('./package').dependencies.react)}/umd/react.production.min.js`,
    global: 'React',
},
{
    module: 'react-dom',
    entry: `https://unpkg.com/react-dom@${getVersion(require('./package').dependencies['react-dom'])}/umd/react-dom.production.min.js`,
    global: 'ReactDOM',
},
];

const vendors = [
    {
        entry: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
    },
];

type Configuration = WebpackConfiguration & {
    devServer: WebpackOptionsNormalized['devServer'];
};

module.exports = (_, argv): Configuration => {
    const isProd = argv.mode === 'production';

    const plugins = [
        new CleanWebpackPlugin(),
        new DefinePlugin({
            __dev__: !isProd,
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            favicon: './src/icons/favicon.ico',
            template: path.join('./src/template/index.html'),
            title: manifest.name,
            meta: {
                viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
                author: manifest.author,
                charset: 'utf-8',
                description: manifest.description,
                'apple-mobile-web-app-status-bar-style': 'black-translucent',
            }
        }),
        !isProd && new ProvidePlugin({
            "React": "react",
         }),
    ].filter(Boolean);
    
    if (isProd) {
        plugins.push(
            new WebpackPwaManifest(manifest),
            new HtmlWebpackExternalsPlugin({ externals }),
            new MiniCssExtractPlugin(),
            // new OfflinePlugin({
            //     ServiceWorker: {
            //         events: true,
            //     },
            //     externals: [...vendors.map(value => value.entry), ...externals.map(value => value.entry)]
            // }),
            new PreloadWebpackPlugin({
                rel: 'preload',
                include: 'allChunks' // or 'initial'
            }),
        );
    }

    return {
        entry: './src/index.tsx',
        mode: argv.mode || 'development',
        module: {
            rules: [
                {
                    test: /\.tsx?/,
                    use: 'babel-loader'
                }, {
                    test: /\.svg/,
                    use: 'react-svg-loader'
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
                    test: /\.jpe?g$|\.gif$|\.woff$|\.woff2$|\.ttf$|\.wav$|\.mp3$/,
                    type: 'asset/resource'
                }
            ]
        },
        plugins,
        resolve: {
            extensions: ['.js', '.ts', '.tsx', '.svg']
        },
        watch: !isProd,
        devServer: {
            compress: true,
            static: {
                directory: path.join(__dirname, '../../dist'),
            },
            hot: true,
            historyApiFallback: true,
            port: config.port,
        },
        devtool: isProd ? 'cheap-source-map' : false,
        externals: isProd ? {
            ...externals.reduce((previousValue, currentValue) => ({
                ...previousValue,
                [currentValue.module]: currentValue.global
            }), {})
        } : {},
        output: {
            path: path.resolve(__dirname, '../../dist'),
            publicPath: '/',
        },
    }
};
