'use strict';

var compose = require('ramda').compose;

var babel = require('./partials/babel');
var defineEnv = require('./partials/defineEnv');
var entryLocal = require('./partials/entryLocal');
var outputLocal = require('./partials/outputLocal');
var baseConfig = require('./webpack.config');

// TODO: support locally served source maps in production (#11)
module.exports = compose(
    babel,
    defineEnv,
    entryLocal,
    outputLocal
)(baseConfig);
