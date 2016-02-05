var Path = require('path');
var fs = require('fs');
var _ = require('lodash');
var util = require('./util');

var MockServerHandler = require('./nightwatch-mocks-handler');
var AppServerHandler = require('./nightwatch-app-handler');
var mocksPort = util.ports.mocksPort;
var appPort = util.ports.appPort;

module.exports = function (options) {
  util.logFile = options.logFile;
  var log = util.log;

  setGlobals();

  var distPath = Path.join(__dirname, '..', '.dist');
  var indexFileName = options.indexFileName || 'index.html';

  var setupTeardownOptions = {
    distPath: distPath,
    indexFileName: indexFileName,
    mocksPort: mocksPort,
    appPort: appPort,
    log: log
  };

  options = _.defaults(setupTeardownOptions, options);

  var mockHandler = new MockServerHandler(options);
  var appHandler = new AppServerHandler(options);

  return {
    before: function (done) {
      log('starting mock server');
      try {
        mockHandler.before(setupTeardownOptions, function (err) {
          if (err) {
            log('mock server not started: ' + err.message + '\n' + err.stack);
            return done(err);
          }
          log('mock server started;  starting app server');

          appHandler.before(setupTeardownOptions, function (err) {
            if (err) {
              log('app server not started: ' + err.message + '\n' + err.stack);
              return done(err);
            }
            log('app server started');

            if (options.onStart) {
              options.onStart(setupTeardownOptions);
            }

            log('startup complete');
            done();
          });
        });
      } catch (e) {
        log('error: ' + e.message + '\n' + e.stack);
      }
    },

    after: function (done) {
      log('stopping mock server');
      mockHandler.after(setupTeardownOptions, function (err) {
        if (err) {
          log('mock server not stopped: ' + err.message);
        } else {
          log('mock server stopped');
        }
        log('stopping app server');

        appHandler.after(setupTeardownOptions, function (err) {
          if (err) {
            log('app server not stopped: ' + err.message);
          } else {
            log('app server stopped');
          }
          done();
        });
      });
    }
  };

  function setGlobals () {
    // tell mock server that it should perform in a testing mode rather than a dev env mode
    global.endToEndTestMode = true;
    // make sure app config knows were in mocks mode (since it won't be a CLI param)
    global.configMode = 'mocks:' + mocksPort;
    // allow app port to be referenced by individual tests
    global.appPort = appPort;
  }
};
