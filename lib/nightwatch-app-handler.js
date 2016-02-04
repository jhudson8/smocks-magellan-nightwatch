var Hapi = require('hapi');
var _ = require('lodash');
var Path = require('path');
var fs = require('fs');
var mimeTypes = require('mime-types');
var configModeInjector = require('./config-mode-injector');

function MocksHandler (options) {
  this.mocksPort = options.mocksPort;
  this.appPort = options.appPort;
  this.log = options.log;

  this.startAppServerFunc = options.appServer && options.appServer.start;
  this.stopAppServerFunc = options.appServer && options.appServer.stop;
}

_.extend(MocksHandler.prototype, {

  /**
   * Start the app server by either using a simple hapi server providing content from the "outputPath" (requires 0 config)
   *
   * or started manually using start/stop async callbacks in the format
   * { appServer: { start: func({port}), stop: ... } }
   */
  before: function (options, callback) {
    var log = this.log;

    log('starting app server');
    if (this.startAppServerFunc) {
      // manual starting of app server
      this.startAppServerFunc(options, callback);
    } else {
      // let smocks-magellan-nightwatch automatically handle the work
      var appServer = this.appServer = new Hapi.Server();
      appServer.connection({ port: this.appPort });
      appServer.route([{
        method: 'GET',
        path: '/{path*}',
        handler: function (req, reply) {
          log('request made: ' + req.path);
          var requestPath = req.path;
          var artifactPath = Path.join(options.distPath, requestPath);
          if (requestPath.match(/\/[^\.]*$/i)) {
            log('handling response as container html file');
            // it's the main index file.  In order to re-use the transpiled files, we need to
            // ensure that the container html file represents the correct mock port so
            // we will replace that out when returning the file contents
            replyWithIndexFile(options, reply);
          } else {
            log('handling response: ' + requestPath);

            fs.exists(artifactPath, function (exists) {
              if (exists) {
                var mimeType = mimeTypes.lookup(artifactPath);
                fs.readFile(artifactPath, function (err, buffer) {
                  if (err) {
                    log('error loading file: ' + artifactPath + ': ' + e.message);
                    reply(err);
                  } else {
                    log('responding with ' + artifactPath);
                    reply(buffer).type(mimeType);
                  }
                });
              } else {
                log(artifactPath + ' does not exist... 404');
                reply({message: artifactPath + ' does not exist'}).code(404);
              }
            });
          }
        }
      }]);
      appServer.start(callback);
    }
  },

  /**
   * Stop the mock server
   */
  after: function (options, callback) {
    if (this.stopAppServerFunc) {
      this.stopAppServerFunc(options, callback);
    } else if (this.appServer) {
      this.appServer.stop(callback);
    } else {
      callback();
    }
  }
});

function replyWithIndexFile (options, reply) {
  var artifactPath = Path.join(options.distPath, options.indexFileName);
  fs.readFile(artifactPath, { encoding: 'utf8' }, function (err, contents) {
    options.log('handling html response: ' + artifactPath);
    if (err) {
      this.log(err);
      return reply(err);
    }
    try {
      contents = configModeInjector(contents, 'mocks:' + options.mocksPort, options.configModeName);
      reply(contents).type('text/html');
    } catch (e) {
      this.log(e.message);
    }
  });
}

module.exports = MocksHandler;
