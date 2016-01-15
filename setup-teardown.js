var Q = require('q');
var path = require('path');
var rmdir = require('rimraf');
var mkdirp = require('mkdirp');
var fs = require('fs');

// in case the mock server start statically... this global var can be evaluated
global.suppressMockServer = true;

module.exports = function (options) {
  var logFile = options.logFile;
  var builder = options.build;
  var distPath = path.join(__dirname, '.dist');

  var SetupTeardown = function () {
  };

  SetupTeardown.prototype = {

    initialize: function () {
      var deferred = Q.defer();

      build(function (err) {
        if (err) {
          return deferred.reject(err);
        }
        deferred.resolve();
      })

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

        deferred.resolve();
      })
      return deferred.promise;
    }
  };

  function build (callback) {
    log('building app: ' + distPath);

    mkdirp(distPath, function (err) {
      if (err) {
        log(distPath + ' could not be created: ' + err.message);
        return callback(err);
      }

      log(distPath + ' directory created');
      builder(distPath, function (err) {
        if (err) {
          log('application build error: ' + err.message);
          console.log('application build error: ', err);
          return callback(err);
        }
        log('application built... starting tests');
        callback();
      });
    });
  }

  function log (message) {
    if (logFile) {
      try {
        fs.appendFileSync(logFile, message + '\n', {encoding: 'utf8'});
      } catch (e) {
        console.log(e.message);
      }
    }
  }

  return SetupTeardown;
}
