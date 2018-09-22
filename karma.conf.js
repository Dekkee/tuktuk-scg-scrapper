const webpackConfig = require('./webpack.config');
const isDocker = require('is-docker')();

module.exports = (config) => {
    config.set({
        frameworks: ['jasmine'],
        browsers: ['ChromeCustom'],
        // ... normal karma configuration
        files: [
            // all files ending in "_test"
            { pattern: '**/*.spec.ts', watched: false },
            // each file acts as entry point for the webpack configuration
        ],

        preprocessors: {
            // add webpack as preprocessor
            '**/*.spec.ts': [ 'webpack' ],
        },

        webpack: {
            // karma watches the test entry points
            // (you don't need to specify the entry option)
            // webpack watches dependencies
            ...webpackConfig()
        },

        webpackMiddleware: {
            // webpack-dev-middleware configuration
            // i. e.
            stats: 'errors-only'
        },
        customLaunchers: {
            ChromeCustom: {
                base: 'ChromeHeadless',
                // We must disable the Chrome sandbox when running Chrome inside Docker (Chrome's sandbox needs
                // more permissions than Docker allows by default)
                flags: isDocker ? ['--no-sandbox'] : []
            }
        },
    })
};
