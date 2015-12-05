var BaseTest = require('../base');

module.exports = new BaseTest({
  'test message': function (client) {
    client.url(this.appUrl('/'))
      .assert.elContainsText('{message}', 'hello world');
  }
});
