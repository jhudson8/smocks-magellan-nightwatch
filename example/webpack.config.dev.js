var path = require('path');
var fs = require('fs');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var configModeInjector = require('smocks-magellan-nightwatch').injectConfigMode;

var webpackConfig = require('./webpack.config');
webpackConfig.plugins = [
  // this will inject our "mocks" config value - you would only do this
  // during local development
  new HtmlWebpackPlugin({
    templateContent: configModeInjector(fs.readFileSync('./web-app/index.html', {encoding: 'utf8'})),
    inject: 'body'
  })
];
module.exports = webpackConfig;

// we know that this is called when wepack is executed so start the mock server
if (!global.testMode) {
  // global.testMode is set when we are in end to end testing mode so
  // we don't want to start the normal dev env mock server in that case
  require('./mocks/run-mock-server');
}

