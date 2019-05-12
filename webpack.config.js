const webpack = require('webpack');
const path = require('path');
const packagejson = require('./package.json');

const dashLibraryName = packagejson.name.replace(/-/g, '_');

const getMode = (env, argv) => {
    let mode;

    // if user specified mode flag take that value
    if (argv && argv.mode) {
        mode = argv.mode;
    }

    // else if configuration object is already set (module.exports) use that value
    else if (module.exports && module.exports.mode) {
        mode = module.exports = mode;
    }

    // else take webpack default
    else {
        mode = 'production';
    }

    return mode;
};

const common = (env, argv) => ({
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                ],
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
            {
                test: /\.txt$/i,
                use: 'raw-loader',
            },
        ],
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(
            /(.*)GlobalErrorContainer.react(\.*)/,
            function(resource) {
                if (getMode(env, argv) === 'production') {
                    resource.request = resource.request.replace(
                        /GlobalErrorContainer.react/,
                        'GlobalErrorContainerPassthrough.react'
                    );
                }
            }
        ),
    ],
});

const standalone = (env, argv) => ({
    ...common(env, argv),
    name: 'standalone',
    entry: {main: ['@babel/polyfill', 'whatwg-fetch', './src/index.js']},
    output: {
        path: path.resolve(__dirname, dashLibraryName),
        filename:
            getMode(env, argv) === 'development'
                ? `${dashLibraryName}.dev.js`
                : `${dashLibraryName}.min.js`,
        library: dashLibraryName,
        libraryTarget: 'window',
    },
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'plotly.js': 'Plotly',
    },
});

const decoupled = (env, argv) => ({
    ...common(env, argv),
    name: 'decoupled',
    entry: './src/decoupled.js',
    output: {
        path: path.resolve(__dirname, dashLibraryName),
        filename:
            getMode(env, argv) === 'development'
                ? `${dashLibraryName}.commonjs.dev.js`
                : `${dashLibraryName}.commonjs.min.js`,
        libraryTarget: 'commonjs2',
    },
});

module.exports = [standalone, decoupled];
