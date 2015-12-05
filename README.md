# smocks-magellan-nightwatch
Adapter for Magellan nightwatch to support the smocks stateful mock server

If you are using [smocks](https://github.com/jhudson8/smocks) as a mock server for your application and want to use [magellan nightwatch](https://github.com/TestArmada/magellan-nightwatch) for end to end tests, you can easily hook up your mock server for your tests (even in parallel).

Forget how it works... just show me an example
----------------------------------------------------
```
git clone https://github.com/jhudson8/smocks-magellan-nightwatch.git
cd smocks-magellan-nightwatch/example
npm install
npm test
```
and take a look at the [example README](./example/README.md)


How it works
------------
You need to refer to configurable API base when executing your XHR calls.  To determine if you are in `mock mode`, a global variable will is introduced into your container HTML page called `configMode`.  This value will (optionally) tell you the port your API base should refer to.

For example, this is an example of what will be injected into your HTML page
```
<script>
  // 12000 would be the mock server port
  var configMode = 'mocks:12000';
</script>
```

And in your application code
```
  // app config data
  var apiBase = '/the/real/api/base';
  var match = (window.configMode || '').match(/mocks:?([0-9]*)/);
  if (match) {
    // port 8000 would be some default mock server port that your app could use when
    // in normal development (not end to end tests)
    apiBase = 'http://localhost:' + (match[1] || '8000')
  }

  module.exports = {
    apiBase: apiBase
  };
```

Hooking into Nightwatch
-----------------------
Follow the [magellan-nightwatch](https://github.com/TestArmada/magellan-nightwatch) instructions to include magellan and nightwatch into your project (basically include the magellan.json and nightwatch.json config files and some package dependencies).

Create a module to be referenced as the [nightwatch globals_path](http://nightwatchjs.org/guide#settings-file) for setup/teardown integration

***nightwatch.json***
```
  ...
  "globals_path": "/path/to/global/module
```

// global nightwatch module example (using webpack)
```
var nightwatchInit = require('magellan-smocks').init({
  // compile any application resources and copy them to the "outputPath"
  // call the "callback" once complete - this is a simple webpack example
  build: function (outputPath, callback) {
    var config = require('my/webpack/config');
    config.output.path = outputPath;
    require('webpack')(config).run(callback);
  },
  // path to your smocks hapi plugin (can be in same repo or a dependency)
  mockServerPlugin: require('path/to/smocks/hapi/plugin')
});

module.exports = {
  before: nightwatchInit.before,
  after: nightwatchInit.after
};

```

Smocks Nightwatch Commands
--------------------------
* resetMockConfig: Reset all fixture config (which can be updated using the `setMockVariant` command)
* resetMockState: Reset the state of the mock server
* setMockVariant: Set a fixture to have a specific variant.  The fixture id and variant id can be seen (if looking at the "Paths" view)... Usage: client.setMockVariant({ fixture: `fixture id`, variant: `variant id` })
