var Q = require('q');
var path = require('path');
var rmdir = require('rimraf');
var mkdirp = require('mkdirp');
var fs = require('fs');

// in case the mock server start statically... this global var can be evaluated
global.suppressMockServer = true;

module.exports = function (options) {
  options.distPath = path.join(__dirname, '.dist');
  options.indexFileName = 'index.html';
  options.indexFilePath = path.join(options.distPath, options.indexFileName);

  var SetupTeardown = function () {
  };

  SetupTeardown.prototype = {

    initialize: function () {
      var deferred = Q.defer();

      build(options, function (err) {
        if (err) {
          return deferred.reject(err);
        }
        deferred.resolve();
      })

      return deferred.promise;
    },

    flush: function () {
      var deferred = Q.defer();

      rmdir(options.distPath, function () {
        deferred.resolve();
      })
      return deferred.promise;
    }
  };

  return SetupTeardown;
}

function build (options, callback) {
  var distPath = options.distPath;
  log('building app: ' + distPath, options);

  mkdirp(distPath, function (err) {
    if (err) {
      log(distPath + ' could not be created: ' + err.message, options);
      console.log('could not create directory: ', distPath);
      return callback(err);
    }

    log(distPath + ' directory created', options);
    options.build(options.distPath, function (err) {
      if (err) {
        log('application build error: ' + err.message, options);
        console.log('application build error: ', err);
        return callback(err);
      }
      log('application built... starting tests', options);
      console.log('application built... starting tests');
      callback();
    });
  });
}

function log (message, options) {
  if (options.logFile) {
    fs.appendFileSync(options.logFile, message + '\n', {encoding: 'utf8'});
  }
}
