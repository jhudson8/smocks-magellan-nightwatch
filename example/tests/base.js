var SuperBase = require('testarmada-magellan-nightwatch/lib/base-test-class');
// allow for {foo} to represent [data-automation-id="foo"]
SuperBase.selectorToken = function (value) {
  return '[data-automation-id="' + value + '"]';
};

var util = require('util');

/**
 * base class used for the test classes (in ./message-tests).  it's only real value
 * is to expose an "appUrl" function.  a global variable is introduced called "appPort"
 * which is the port onn localhost that the current nightwatch worker is running
 * the application on
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

  // each nightwatch worker has it's own running instance of the mock server and app server
  // so we expose this method to nightwatch test classes to provide an easy way of
  // referring to application URLs
  appUrl: function (path) {
    return 'http://localhost:' + global.appPort + path
  }
};

module.exports = Base;
