var _ = require('lodash');
var STATES = {};

module.exports = {

  initialize: function(request, callback) {
    var key = getStateKey(request);
    var doInitialize = !STATES[key];
    if (doInitialize) {
      STATES[key] = {user: {}, route: {}};
    }
    callback(undefined, doInitialize);
  },

  userState: function(request) {
    var key = getStateKey(request);
    return STATES[key].user;
  },

  resetUserState: function(request, initialState) {
    var key = getStateKey(request);
    STATES[key].user = initialState;
  },

  routeState: function(request) {
    var key = getStateKey(request);
    return STATES[key].route;
  },

  resetRouteState: function(request) {
    var key = getStateKey(request);
    STATES[key].route = {};
  }
};

function getStateKey (request) {
  var referer = request.headers.referer;
  if (!referer) {
    console.log('referrer unknown - multiport state can not work correctly');
    return 'default';
  } else {
    var match = referer.match(/^(https?)?:?\/\/[^:\/]+(:[0-9]*)?/);
    return match[2] ? match[2].substring(1) : 'default';
  }
}
