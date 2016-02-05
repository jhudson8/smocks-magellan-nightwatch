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

// we know that webpack.config.dev is execuited when we are doing local development so
// auto-start the mock server
if (!global.testMode) {
  // global.testMode is set when we are in end to end testing mode so
  // we don't want to start the normal dev env mock server in that case
  // because each nightwatch worker will start their own mock server
  require('./mocks/run-mock-server');
}
