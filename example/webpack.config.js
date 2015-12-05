var path = require('path');
var fs = require('fs');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var configModeInjector = require('smocks-magellan-nightwatch').injectConfigMode;

module.exports = {
  context: __dirname,
  entry: path.join(__dirname, 'index.js'),
  output: {
    path: path.join(__dirname, 'dist')
  },
  plugins: [
    // this will inject our "mocks" config value - you would only do this
    // during local development
    new HtmlWebpackPlugin({
      templateContent: configModeInjector(fs.readFileSync('./index.html', {encoding: 'utf8'})),
      inject: 'body'
    }),
  ]
};

