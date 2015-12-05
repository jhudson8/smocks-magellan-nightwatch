var Hapi = require('hapi');
var path = require('path');
var fs = require('fs');
var minimist = require('minimist');
var mkdirp = require('mkdirp');
var webpack = require('webpack');
var configModeInjector = require('./config-mode-injector');
var argv = minimist(process.argv.slice(2));
var appPort = parseInt(argv.mocking_port, 10);

// buffer in case more workers are run that the previous build
// for trying to determine if this is a new magellan build
var MAX_TEST_TIME = 1000 * 60;

// keep reference to servers so we can shut them back down
var mockServer;
var appServer;

module.exports = function (options) {
  // +1 is used for selennium
  var mockPort = global.mockPort = appPort + 2;
  // tell mock server that it should perform in a testing mode rather than a dev env mode
  global.testMode = true;
  // make sure webpack config knows were in mocks mode (since it won't be a CLI param)
  global.configMode = 'mocks:' + mockPort;
  // allow app port to be referenced by individual tests
  global.appPort = appPort;

  options.mockPort = mockPort;
  options.distPath = path.join(__dirname, '..', '.dist');
  options.statusFilePath = path.join(options.distPath, '.status');
  options.indexFileName = options.indexFileName || 'index.html';
  options.indexFilePath = path.join(options.distPath, options.indexFileName);

  return {
    before: function (done) {
      log('====== STARTUP =========', options);
      startMockServer(options, function (err) {
        if (err) {
          return done(err);
        }
        log('mock server started', options);

        compileApp(options, function (err) {
          if (err) {
            return done(err);
          }
          log('app compiled', options);

          startAppServer(options, function (err) {
            log('====== STARTUP COMPLETE =========', options);
            done(err);
          });
        });
      });
    },

    after: function (_done) {
      function done (err) {
        log('====== SHUTDOWN COMPLETE =========', options);
        _done(err);
      }

      log('====== SHUTDOWN =========', options);
      // shut down the app and mock server
      if (mockServer) {
        log('stopping mock server', options);
        mockServer.stop(function () {
          log('mock server stopped', options);
          if (appServer) {
            log('stopping app server', options);
            appServer.stop(done);
          } else {
            done();
          }
        });
      } else {
        done();
      }
    }
  };
}

/**
 * Get the webpack config and transpile all required artifacts under the `dist` directory.
 * The code here seems a bit complex but it is
 * - ensuring that only a single build happens for all parallel processes
 * - handling first run paralellel processes (which would both potentally both build at the same time)
 *
 * a ".status" file keeps state for these processes.  If a build is currently in progress, any
 * worker will wait and keep polling the status file until the build is ready (or a timeout occurs)
 */
function compileApp (options, callback) {
  var distPath = options.distPath;
  var statusFilePath = options.statusFilePath;

  log('initializing app compilation', options);
  
  mkdirp(distPath, function (err) {
    if (err) {
      return callback(err);
    }

    var status = determineBuildStatus(options);
    if (status === 'complete') {
      // we don't need to build
      markAsBuilt(options);
      callback();
    } else if (status === 'waiting') {
      // we need to keep checking until buid is complete
      waitForBuild(options, callback);
    } else {
      // try to avoid multiple parallel builds at the same time by introducing a small bit of randomness
      var blockTime = Math.floor(Math.random() * 2000);
      log('a build needs to happen - to prevent multiple builds, waiting for random interval: ' + blockTime, options);
      setTimeout(function () {
        status = determineBuildStatus(options);
        log('block time up: ' + status, options);
        if (status === 'complete') {
          // this would be crazy but the build completed within our little bit of random window
          markAsBuilt(options);
          callback();
        } else if (status === 'build') {
          startBuild(options, callback)
        } else {
          waitForBuild(options, callback);
        }
      }, blockTime);
    }
  });
}

function startBuild (options, callback) {
  log('======  compiling application =====', options);
  fs.writeFileSync(options.statusFilePath, 'building', {encoding: 'utf8'});
  options.build(options.distPath, function (err) {
    if (err) {
      return callback(err);
    }
    markAsBuilt(options);
    callback();
  });
}

/**
 * Determine the status of wheter we should run a new build or now
 * return one of
 *   - "build": a build needs to occur
 *   - "waiting": waiting for a build
 *   - "complete": build is complete
 */
function determineBuildStatus (options) {
  log('checking status file', options);
  var statusFilePath = options.statusFilePath;
  if (fs.existsSync(statusFilePath)) {
    var status = fs.readFileSync(statusFilePath, {encoding: 'utf8'});
    if (status === '') {
      // assume we actually don't have a status file
      return 'build';
    }

    log('status file exists: ' + status, options);
    // we are either building or fully built
    if (status === 'building') {
      log('going to wait for build', options);
      return 'waiting';
    } else if (status.indexOf('built') === 0) {
      if (!fs.existsSync(options.indexFilePath)) {
        // last build was cancelled early... abort
        return 'build';
      }
      if (shouldRebuild(status, options)) {
        log('need to rebuild', options);
        // even though there is a "built" status file, this is is a new
        // magellan process which requires a rebuild
        return 'build';
      }

      log('build complete', options);
      // we're all done
      return 'complete';
    }
  }

  log('no status file... need to rebuild', options);
  return 'build';
}

/**
 * Monitor the file designated by {path} until the contents show "built" or until we timeout
 */
function waitForBuild (options, callback) {
  log('waiting for another build process to complete', options);
  var statusFilePath = options.statusFilePath;
  var timeout = new Date().getTime() + (1000 * 60 * 3); // max build 3 minutes
  function _check () {
    fs.readFile(statusFilePath, {encoding: 'utf8'}, function (err, status) {
      log('checking on other build process status: ' + status, options);
      if (err) {
        return callback(err);
      }

      if (status.match(/built/)) {
        log('other build is complete... moving on: ' + status, options);
        markAsBuilt(options);
        return callback();
      }

      if (new Date().getTime() > timeout) {
        return callback(new Error('build timeout: ' + status));
      }

      // poll every 3 seconds
      setTimeout(_check, 3000);
    });
  }
  _check();
}

function shouldRebuild (status, options) {
  var match = status.match(/:([0-9]+)$/);
  if (!match || parseInt(match[1], 10) <= new Date().getTime()) {
    // we've passed the build TTL so we're going to trigger another anyway
    // (fuzzy way of assuming that we are hitting a new magellan build)
    log('forcing a new build', options);
    fs.writeFileSync(options.statusFilePath, '', {encoding: 'utf8'});
    return true;
  }
}

function markAsBuilt (options) {
  var timeout = new Date().getTime() + MAX_TEST_TIME;
  log('marking as built: ' + timeout, options);
  fs.writeFileSync(options.statusFilePath, 'built:' + timeout, {encoding: 'utf8'});
}

/**
 * Create a simple hapi server that will serve out the w2g web application (from `dist`)
 */
function startAppServer (options, callback) {
  var indexFileName = options.indexFileName;
  log('starting app server', options);
  appServer = new Hapi.Server();
  appServer.connection({port: appPort});
  appServer.route([{
    method: 'GET',
    path: '/{path*}',
    handler: function (req, reply) {
      var requestPath = req.params.path || options.indexFileName;
      var artifactPath = path.join(options.distPath, requestPath);
      if (requestPath.match(/\.html$/i)) {
        // it's the main index file.  In order to re-use the transpiled files, we need to
        // ensure that the container html file represents the correct mock port so
        // we will replace that out when returning the file contents
        fs.readFile(artifactPath, {encoding: 'utf8'}, function (err, contents) {
          log('handling html response: ' + req.path, options);
          if (err) {
            log(err, options);
            return reply(err);
          }
          try {
            contents = configModeInjector(contents, 'mocks:' + options.mockPort, options.configModeName);
            reply(contents).type("text/html");
          } catch (e) {
            log(e, options);
          }
        });
      } else {
        log('handling response: ' + requestPath, options);
        reply.file(artifactPath);
      }
    }
  }]);
  appServer.start(callback);
}

/**
 * Start the mock server
 */
function startMockServer (options, callback) {
  log('starting mock server', options);
  var mockServerPlugin = options.mockServerPlugin;
  var mockServerOptions = options.mockServerOptions || {connections: {routes: {cors: true}}};
  mockServer = new Hapi.Server(mockServerOptions);
  mockServer.connection({port: options.mockPort});

  mockServer.register(mockServerPlugin, function (err) {
    log('registered mock server plugin', options);
    if (err) {
      return callback(err);
    }

    mockServer.start(callback);
  });
}

function log (message, options) {
  if (options.logFile) {
    fs.appendFileSync(options.logFile, '( worker: ' + appPort + ' )  ' + message + '\n', {encoding: 'utf8'});
  }
}
