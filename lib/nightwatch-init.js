var Hapi = require('hapi');
var path = require('path');
var fs = require('fs');
var minimist = require('minimist');
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
  // make sure app config knows were in mocks mode (since it won't be a CLI param)
  global.configMode = 'mocks:' + mockPort;
  // allow app port to be referenced by individual tests
  global.appPort = appPort;

  options.mockPort = mockPort;
  options.distPath = path.join(__dirname, '..', '.dist');
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

        startAppServer(options, function (err) {
          log('====== STARTUP COMPLETE =========', options);
          done(err);
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
      log('request made: ' + req.path, options);
      var requestPath = req.path;
      var artifactPath = path.join(options.distPath, requestPath);
      if (requestPath === '/' || requestPath.match(/\.html$/i)) {
        // it's the main index file.  In order to re-use the transpiled files, we need to
        // ensure that the container html file represents the correct mock port so
        // we will replace that out when returning the file contents
        replyWithIndexFile(options, reply);
      } else {
        log('handling response: ' + requestPath, options);
        reply.file(artifactPath);
      }
    }
  }]);
  appServer.start(callback);
}

function replyWithIndexFile(options, reply) {
  var artifactPath = path.join(options.distPath, options.indexFileName);
  fs.readFile(artifactPath, {encoding: 'utf8'}, function (err, contents) {
    log('handling html response: ' + artifactPath, options);
    if (err) {
      log(err, options);
      return reply(err);
    }
    try {
      contents = configModeInjector(contents, 'mocks:' + options.mockPort, options.configModeName);
      log(contents, options);
      reply(contents).type("text/html");
    } catch (e) {
      log(e, options);
    }
  });
}

/**
 * Start the mock server
 */
function startMockServer (options, callback) {
  log('NIGHTWATCH: starting mock server', options);
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
