var BaseTest = require('../base');

// set the alternate variant of the message fixture and verify that scenario
module.exports = new BaseTest({
  'test message': function (client) {
    // here we are using a mock server RESTful call to change the
    // variant that the message fixture should be returning (to "hello universe")
    client.setMockVariant({fixture: 'message', variant: 'universe'})
      .url(this.appUrl('/'))
      .assert.elContainsText('{message}', 'hello universe');
  }
});
