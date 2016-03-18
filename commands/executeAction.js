var Util = require('util');
var CommandUtil = require('../lib/util');
var events = require('events');

/**
 * Execute a route action
 * Usage: client.executeAction({ route: `route id`, action: `action id` input: {any action input} })
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

  CommandUtil.executeMockAPI('/action', options, _callback);

  return this;
};

module.exports = MockCommand;
