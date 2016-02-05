// this is used as the magellan global objct so we can have access
// to the worker global setup and teardown.  this module is referenced
// because it is defined as "setup_teardown" in the magellan.json file

module.exports = require('smocks-magellan-nightwatch').magellan({

  // build our application assets to the "options.distPath" provided
  before: function (options, callback) {
    var config = require('../webpack.config.js');
    config.output.path = options.distPath;
    require('webpack')(config).run(callback);
  }
});
