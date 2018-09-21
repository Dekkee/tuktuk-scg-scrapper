const webpackConfig = require('./webpack.config');

module.exports = (config) => {
    config.set({
        frameworks: ['jasmine'],
        browsers: ['ChromeHeadless'],
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
        }
    })
};
