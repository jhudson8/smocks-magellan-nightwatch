var Util = require('util');
var CommandUtil = require('../lib/util');
var events = require('events');

/**
 * Set a route to have a specific variant.
 * The route id and variant id can be seen (if looking at the "Paths" view)...
 * Usage: client.setMockVariant({ route: `route id`, variant: `variant id` })
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

  CommandUtil.executeMockAPI('/route/' + encodeURIComponent(options.route || options.fixture), {
    input: {
      variant: options.input
    }
  }, _callback);

  return this;
};

module.exports = MockCommand;
