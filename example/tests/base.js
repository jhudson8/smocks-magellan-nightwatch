var SuperBase = require('testarmada-magellan-nightwatch/lib/base-test-class');
// allow for {foo} to represent [data-automation-id="foo"]
SuperBase.selectorToken = function (value) {
  return '[data-automation-id="' + value + '"]';
};

var util = require('util');

/**
 * Base class which provides global setup / teardown
 */
var Base = function (steps) {
  SuperBase.call(this, steps);
};

util.inherits(Base, SuperBase);

Base.prototype = {
  before: function (client) {
    SuperBase.prototype.before.call(this, client);
  },

  after: function (client, callback) {
    SuperBase.prototype.after.call(this, client, callback);
  },

  appUrl: function (path) {
    return 'http://localhost:' + global.appPort + path
  }
};

module.exports = Base;
