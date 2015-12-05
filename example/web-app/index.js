// *very simple example application which executes an XHR request to get
// a message and insert the message into the DOM

// our config data which includes the "apiBase"
var Config = require('./config');

var $ = require('jquery');
$.ajax(Config.apiBase + '/message', {
  success: function (data) {
    document.getElementById('content').innerText = data.message;
  }
});
