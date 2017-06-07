'use strict';

var partial = require('webpack-partial').default;

module.exports = function (config) {
    return partial(config, {
        entry: {bundle: [
            'whatwg-fetch',
             './local.js'
        ]}
    });
};
