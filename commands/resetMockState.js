var Util = require('util');
var CommandUtil = require('../lib/util');
var events = require('events');

/**
 * Reset all fixture config (which can be updated using the `setMockVariant` command)
 * Usage: client.resetMockConfig()
 */

function MockCommand () {
  events.EventEmitter.call(this);
}

Util.inherits(MockCommand, events.EventEmitter);

MockCommand.prototype.command = function (options, callback) {
  var self = this;
  var _callback = function () {
    callback && callback();
    self.emit('complete');
  };

  CommandUtil.executeMockAPI('/state/reset', undefined, _callback);

  return this;
};

module.exports = MockCommand;
