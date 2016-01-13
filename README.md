# smocks-magellan-nightwatch
Adapter for Magellan nightwatch to support the smocks stateful mock server

If you are using [smocks](https://github.com/jhudson8/smocks) as a mock server for your application and want to use [magellan nightwatch](https://github.com/TestArmada/magellan-nightwatch) for end to end tests, you can easily hook up your mock server for your tests.  This will build your app once but start an app server and mock server instance for each nightwatch work to support as many parallel workers as you can handle.


Forget how it works... just show me an example
----------------------------------------------------
```
git clone https://github.com/jhudson8/smocks-magellan-nightwatch.git
cd smocks-magellan-nightwatch/example
npm install
npm test
```
and take a look at the [example code](./example)


How it works
------------
There are 2 small setup scripts which are required

magellan setup/teardown (referenced from magellan.json) see [https://github.com/TestArmada/magellan#setup-and-teardown](https://github.com/TestArmada/magellan#setup-and-teardown) which is required to copy your application static files to the directory that the nightwatch workers will be serving out.  It looks something like this
```
module.exports = require('smocks-magellan-nightwatch/setup-teardown').init({

  // bould our application assets to the "outputPath" provided
  build: function (outputPath, callback) {
    // simple webpack example to build and copy all files to the output path provided
    var config = require('webpack.config.js');
    config.output.path = outputPath;
    require('webpack')(config).run(callback);
  }
});
```

nightwatch setup/teardown setup/teardown referenced as the [nightwatch globals_path](http://nightwatchjs.org/guide#settings-file) in your nightwatch.json file.  This is used to start an app server to serve out the static contents as well as your smocks server for each worker.  It will look something like this
```
module.exports = require('smocks-magellan-nightwatch').init({

  // point to our mock server hapi plugin
  mockServerPlugin: require('../mocks/mock-server-hapi-plugin')
});
```

You need to refer to configurable API base when executing your XHR calls.  To determine if you are in `mock mode`, a global variable is automatically applied to your container HTML page called `configMode`.  This value will (optionally) tell you the port your API base should refer to.

For example, this is an example of what will be magically injected into your HTML page
```
<script>
  // 12000 would be the mock server port
  var configMode = 'mocks:12000';
</script>
```

And in your application code you could do something like this
```
  // app config module to be referenced in your app
  var apiBase = '/the/real/api/base';

  // see if we should be using the mock server
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

#### available options

* ***configModeName***: if you want to change the global variable to something other than `configMode`
* ***mockServerPlugin***: mock server plugin module (see [./example/mocks/mock-server-hapi-plugin.js](./example/mocks/mock-server-hapi-plugin.js) for example)
* ***logFile***: for debugging purposes


Smocks Nightwatch Commands
--------------------------
By adding the following entry as a custom command path in your [nightwatch.json](http://nightwatchjs.org/guide#settings-file), you can control the smocks server in your end to end tests
```
  "custom_commands_path": [
    ...
    "./node_modules/smocks-magellan-nightwatch/commands"
  ],
```

* ***resetMockConfig***: Reset all fixture config (which can be updated using the `setMockVariant` command)
* ***resetMockState***: Reset the state of the mock server
* ***setMockVariant***: Set a fixture to have a specific variant.  The fixture id and variant id can be seen (if looking at the "Paths" view)... Usage:
```
  browser.setMockVariant({ fixture: "fixture id", variant: "variant id" });
```