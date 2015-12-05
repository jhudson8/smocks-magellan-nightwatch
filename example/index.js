// *very simple example application
require('es6-promise');
require('whatwg-fetch');

var Config = require('./config');

var $ = require('jquery');
$.ajax(Config.apiBase + '/message', {
  success: function (data) {
    document.getElementById('content').innerText = data.message;
  }
});
