var Hapi = require('hapi');
var _ = require('lodash');
var multiportState = require('./multiport-state');

function MocksHandler (options) {
  this.mocksPort = options.mocksPort;
  this.log = options.log;
  this.log('new nightwatch handler instance');

  // mock server start/stop handlers and config options
  this.mockServerPlugin = options.mockServer;
  this.startMockServerFunc = options.mockServer && options.mockServer.start;
  this.stopMockServerFunc = options.mockServer && options.mockServer.stop;
  if (this.startMockServerFunc || this.stopMockServerFunc) {
    // we are manually starting/stopping the mock server so the plugin would not have been applied
    this.mockServerPlugin = undefined;
  }
  if (options.mockServer && options.mockServer.plugin) {
    // allow for {plugin: ..., init: ...}
    this.mockServerPlugin = options.mockServer.plugin;
  }
  this.mockServerOptions = options.mockServerOptions || {
    connections: {routes: {cors: true}}
  };
}

_.extend(MocksHandler.prototype, {

  /**
   * Start the mock server by either using a provided plugin in the format
   * { mockServer: {plugin} } or { mockServer: { plugin: {plugin},  } }
   *
   * or started manually using start/stop async callbacks in the format
   * { mockServer: { start: func({port}), stop: ... } }
   */
  before: function (options, callback) {
    var log = this.log;

    if (this.startMockServerFunc) {
      log('manual mock server startup');
      // app specific test runner does most of the work
      this.startMockServerFunc(options, callback);
    } else if (this.mockServerPlugin) {
      log('using mock server plugin');
      // adapter does most of the work

      // override the state handler to work with multiport parallel processes
      this.mockServerPlugin.overrideState = multiportState;

      var mockServer = this.mockServer = new Hapi.Server(this.mockServerOptions);
      mockServer.connection({ port: this.mocksPort });
      mockServer.register(this.mockServerPlugin, function (err) {
        if (err) {
          log('registered mock server plugin: ' + err.message);
          return callback(err);
        }
        log('registered mock server plugin;  starting mock server');
        mockServer.start(callback);
      });
    } else {
      log('no mock server setup/teardown functions provided *and* no plugin provided... not starting mock server');
      callback();
    }
  },

  /**
   * Stop the mock server
   */
  after: function (options, callback) {
    if (this.stopMockServerFunc) {
      this.stopMockServerFunc(options, callback);
    } else if (this.mockServer) {
      this.mockServer.stop(callback);
    } else {
      callback();
    }
  }
});

module.exports = MocksHandler;
