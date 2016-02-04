/**
 * Inject a "configMode" value in an existing HTML payload
 */
module.exports = function (contents, value, varName) {
  varName = varName || 'configMode';
  value = value || 'mocks';
  var mockVarReplaced = false;
  var pattern = new RegExp(varName + '\\s*=\\s*[\'"][^\'"]*[\'"]', 'g');
  contents = contents.replace(pattern, function (val) {
    mockVarReplaced = true;
    return 'configMode = "' + value + '"';
  });
  if (!mockVarReplaced) {
    contents = contents.replace(/<\s*body\s*>/g, function (val) {
      return '<body><script>var configMode = "' + value + '";</script>';
    });
  }
  return contents;
};
