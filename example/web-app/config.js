  // app config data

  // this would be the actual apiBase (in a non-mock situation)
  var apiBase = '/the/real/api/base';

  // see if there is a configMode which identifies that we are in mock mode
  var match = (global.configMode || '').match(/mocks:?([0-9]*)/);
  if (match) {
    // port 8000 would be some default mock server port that your app could use when
    // in normal development (not end to end tests)
    apiBase = 'http://localhost:' + (match[1] || '8000')
  }

  module.exports = {
    apiBase: apiBase
  };