  // app config data
  var apiBase = '/the/real/api/base';
  var match = (global.configMode || '').match(/mocks:?([0-9]*)/);
  if (match) {
    // port 8000 would be some default mock server port that your app could use when
    // in normal development (not end to end tests)
    apiBase = 'http://localhost:' + (match[1] || '8000')
  }

  module.exports = {
    apiBase: apiBase
  };