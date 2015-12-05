var BaseTest = require('../base');

// set the alternate variant of the message fixture and verify that scenario
module.exports = new BaseTest({
  'test message': function (client) {
    client.setMockVariant({fixture: 'message', variant: 'universe'})
      .url(this.appUrl('/'))
      .assert.elContainsText('{message}', 'hello universe');
  }
});
