var Wreck = require('wreck');

module.exports = {
  executeMockAPI: executeMockAPI
};

function executeMockAPI (path, payload, callback) {
  var wreckOptions = {
    payload: payload && JSON.stringify(payload)
  };
  Wreck.post('http://localhost:' + global.mockPort + '/_admin/api' + path, wreckOptions, callback);
}
