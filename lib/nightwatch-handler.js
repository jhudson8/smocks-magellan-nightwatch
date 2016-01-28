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

  var distPath = path.join(__dirname, '..', '.dist');
  var indexFileName = options.indexFileName || 'index.html';
  var indexFilePath = path.join(distPath, indexFileName);

  var mockServerPlugin = options.mockServer;
  var mockServerInfoFunc = options.mockServer && options.mockServer.info;
  var startMockServerFunc = options.mockServer && options.mockServer.start;
  var stopMockServerFunc = options.mockServer && options.mockServer.stop;
  if (startMockServerFunc || stopMockServerFunc) {
    mockServerPlugin = undefined;
  }
  if (options.mockServer && options.mockServer.plugin) {
    mockServerPlugin = options.mockServer.plugin;
  }

  var startAppServerFunc = options.appServer && options.appServer.start;
  var stopAppServerFunc = options.appServer && options.appServer.stop;

  var mockServerOptions = options.mockServerOptions || {
    connections: {routes: {cors: true}}
  };
  var logFile = options.logFile;
  var configModeName = options.configModeName;

  return {
    before: function (done) {
      log('====== STARTUP =========');
      startMockServer(function (err) {
        if (err) {
          return done(err);
        }
        log('mock server started');

        startAppServer(function (err) {
          log('====== STARTUP COMPLETE =========');
          done(err);
        });
      });
    },

    after: function (_done) {
      function done (err) {
        log('====== SHUTDOWN COMPLETE =========');
        _done(err);
      }

      log('====== SHUTDOWN =========');
      stopMockServer(function () {
        stopAppServer(done);
      });
    }
  };

  /**
   * Create a simple hapi server that will serve out the w2g web application (from `dist`)
   */
  function startAppServer (callback) {
    if (mockServerInfoFunc) {
      mockServerInfoFunc({
        appPort: appPort,
        mocksPort: mockPort,
        outputPath: distPath
      });
    }

    log('starting app server');
    if (startAppServerFunc) {
      // manual starting of app server
      startAppServerFunc({
        appPort: appPort,
        mocksPort: mockPort,
        outputPath: distPath
      }, callback);

    } else {
      // smocks-magellan-nightwatch handles the work
      appServer = new Hapi.Server();
      appServer.connection({port: appPort});
      appServer.route([{
        method: 'GET',
        path: '/{path*}',
        handler: function (req, reply) {
          log('request made: ' + req.path);
          var requestPath = req.path;
          var artifactPath = path.join(distPath, requestPath);
          if (requestPath === '/' || requestPath.match(/\.html$/i)) {
            // it's the main index file.  In order to re-use the transpiled files, we need to
            // ensure that the container html file represents the correct mock port so
            // we will replace that out when returning the file contents
            replyWithIndexFile(reply);
          } else {
            log('handling response: ' + requestPath);
            reply.file(artifactPath);
          }
        }
      }]);
      appServer.start(callback);
    }
  }

  function replyWithIndexFile(reply) {
    var artifactPath = path.join(distPath, indexFileName);
    fs.readFile(artifactPath, {encoding: 'utf8'}, function (err, contents) {
      log('handling html response: ' + artifactPath);
      if (err) {
        log(err);
        return reply(err);
      }
      try {
        contents = configModeInjector(contents, 'mocks:' + mockPort, configModeName);
        reply(contents).type("text/html");
      } catch (e) {
        log(e.message);
      }
    });
  }

  function stopMockServer (callback) {
    if (stopMockServerFunc) {
      stopMockServerFunc(callback);

    } else if (mockServer) {
      mockServer.stop(callback);

    } else {
      callback();
    }
  }

  function stopAppServer (callback) {
    if (stopAppServerFunc) {
      stopAppServerFunc(callback);

    } else if (appServer) {
      appServer.stop(callback);

    } else {
      callback();
    }
  }

  /**
   * Start the mock server
   */
  function startMockServer (callback) {
    if (startMockServerFunc) {
      // app specific test runner does most of the work
      startMockServerFunc({
        port: mockPort
      }, callback);

    } else if (mockServer) {
      // adapter does most of the work
      log('NIGHTWATCH: starting mock server');
      mockServer = new Hapi.Server(mockServerOptions);
      mockServer.connection({port: mockPort});

      mockServer.register(mockServerPlugin, function (err) {
        log('registered mock server plugin');
        if (err) {
          return callback(err);
        }

        mockServer.start(callback);
      });
    }
  }

  function log (message) {
    if (logFile) {
      fs.appendFileSync(logFile, '( worker: ' + appPort + ' )  ' + message + '\n', {encoding: 'utf8'});
    }
  }
}
