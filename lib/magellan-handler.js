var Q = require('q');
var path = require('path');
var rmdir = require('rimraf');
var mkdirp = require('mkdirp');
var fs = require('fs');
var util = require('./util');

// in case the mock server start statically... this global var can be evaluated
global.suppressMockServer = true;

module.exports = function (options) {
  util.logFile = options.logFile;
  var log = util.log;

  log('creating magellan global setup/teardown class');

  var setup = options.before;
  var teardown = options.after;
  var distPath = path.join(__dirname, '..', '.dist');
  var setupTeardownOptions = {
    distPath: distPath,
    log: log,
    setMocksPort: function (port) {
      process.env.mocksPort = port;
    }
  };

  var SetupTeardown = function () {
  };

  SetupTeardown.prototype = {

    initialize: function () {
      var deferred = Q.defer();
      log('starting setup: ' + distPath);

      mkdirp(distPath, function (err) {
        if (err) {
          log(distPath + ' could not be created: ' + err.message);
          return deferred.reject(err);
        }

        log(distPath + ' directory created');
        if (!setup) {
          throw new Error('Your magellan init file must contain a `before` lifecycle method');
        }
        setup(setupTeardownOptions, function (err) {
          if (err) {
            log('setup error: ' + err.message);
            return deferred.resolve();
          }
          log('setup complete... starting tests');
          deferred.resolve();
        });
      });

      return deferred.promise;
    },

    flush: function () {
      var deferred = Q.defer();

      rmdir(distPath, function (err) {
        if (err) {
          log(distPath + ' directory not cleaned up: ' + err.message);
        } else {
          log(distPath + ' directory cleaned up');
        }

        if (teardown) {
          teardown(setupTeardownOptions, function (err) {
            if (err) {
              log('teardown error' + err.message);
            }
            deferred.resolve();
          });
        } else {
          log('no teardown function.  magellan global teardown complete');
          deferred.resolve();
        }
      });

      return deferred.promise;
    }
  };

  return SetupTeardown;
};
