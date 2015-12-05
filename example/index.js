// *very simple example application
var Config = require('./config');

var $ = require('jquery');
$.ajax(Config.apiBase + '/message', {
  success: function (data) {
    document.getElementById('content').innerText = data.message;
  }
});
