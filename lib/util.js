var fs = require('fs');
var Wreck = require('wreck');
var minimist = require('minimist');
var argv = minimist(process.argv.slice(2));
var appPort = parseInt(argv.mocking_port, 10);
// +1 is used for selennium
var mocksPort = process.env.mocksPort || appPort + 2;

var util = module.exports = {
  executeMockAPI: executeMockAPI,
  ports: {
    appPort: appPort,
    mocksPort: mocksPort
  },
  log: log
};

function executeMockAPI (path, payload, callback) {
  var wreckOptions = {
    headers: {
      referer: 'http://localhost:' + appPort + '/'
    },
    payload: payload && JSON.stringify(payload)
  };
  var url = 'http://localhost:' + mocksPort + '/_admin/api' + path;
  log('executing mock API: ' + url + '\n' + JSON.stringify(wreckOptions));
  Wreck.post(url, wreckOptions, callback);
}

function log (message) {
  if (util.logFile) {
    try {
      fs.appendFileSync(util.logFile, 'magellan: ' + message + '\n', { encoding: 'utf8' });
    } catch (e) {
      console.log(e.message);
    }
  }
}
