var BaseTest = require('../base');

module.exports = new BaseTest({
  'test message': function (client) {
    client
      // set the input "message" value associated with the endpoint
      .setRouteInput({fixture: 'message', input: {message: 'test message'}})
      .url(this.appUrl('/'))
      .assert.elContainsText('{message}', 'test message');
  }
});
