var fs = require('fs');

return function (options) {
  // get the content
  var content = options.content;
  if (typeof content === 'function') {
    content = content(options);
  }
  if (!content && options.path) {
    content = fs.readFileSync(path, {encoding: 'utf8'});
  }

  var suppressMocks = options.suppressMocks || process.env.NODE_ENV === 'production';

  // include the mock global var
  if (!suppressMocks) {
    content = content.replace(/<\s*\/\s*body\s*>/ig, '<script>var configMode = "mocks";</script></body>');
  }
  return content;
}
