var nightwatchInit = require('smocks-magellan-nightwatch').init({
  build: function (outputPath, callback) {
    var config = require('../webpack.config.js');
    config.output.path = outputPath;
    require('webpack')(config).run(callback);
  },
  mockServerPlugin: require('../mocks/mock-server-hapi-plugin')
});

module.exports = {
  before: nightwatchInit.before,
  after: nightwatchInit.after
};
