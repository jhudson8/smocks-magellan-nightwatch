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


Installation
------------
There are 2 setup scripts which are required (for nightwatch and magellan)

* Magellan setup/teardown (referenced from magellan.json) see [https://github.com/TestArmada/magellan#setup-and-teardown](https://github.com/TestArmada/magellan#setup-and-teardown)
* Nightwatch setup/teardown setup/teardown referenced as the [nightwatch globals_path](http://nightwatchjs.org/guide#settings-file) in your nightwatch.json file

### Easy (and more opinionated) way

Magellan init file (build application resources)
```
module.exports = require('smocks-magellan-nightwatch').magellan({

  // build your application assets to the "outputPath" provided
  before: function (options, callback) {
    var distPath = options.distPath;
    // build/copy all SPA application files to the distPath
    // note: distPath will always be cleaned up after the tests are complete
  }
});
```

Nightwatch init file (provide mock server plugin reference)
```
module.exports = require('smocks-magellan-nightwatch').nightwatch({

  // point to our mock server hapi plugin
  mockServerPlugin: require('../mocks/mock-server-hapi-plugin')
});
```

### Manual (and less opinionated) way

Your magellan and nightwatch file can be just simple hooks into the end to end process.  You can mix and match automated app server and mock server builds so you don't necessarily have to commit to the manual route for everything.

Magellan init file (build application resources)
```
module.exports = require('smocks-magellan-nightwatch').magellan({

  // build your application assets to the "outputPath" provided
  before: function (options, callback) {
    // do whatever you want - executed before any nightwatch worker is executed
  },

  after: function (options, callback) {
    // do whatever you want - executed after all nightwatch tests have completed
  }
});
```

Nightwatch init file
```
module.exports = require('smocks-magellan-nightwatch').nightwatch({

  // build your application assets to the "outputPath" provided
  before: function (options, callback) {
    // do whatever you want - executed before each individual nightwatch worker runs the test
  },

  after: function (options, callback) {
    // do whatever you want - executed after each individual nightwatch worker runs the test
  }
});
```

### Magellan init attributes and options
All functions that have a `callback` parameter are assumed to be async.  The `callback` function *must be called* once execution is complete.  If execution is successful, no arguments should be provided.  Otherwise the first argument should be the error that was encountered.

#### `smocks-magellan-nightwatch.magellan` attributes

* ***before(options, callback)***: (optional) async callback executed before any nightwatch worker is executed.  Normally you would build your application at this time.
* ***after(options, callback)***: (optional) async callbac executed after all nightwatch tests have completed.
* ***logFile***: (optional) a log file for debugging purposes (because logging is difficult when running in parallel)

#### `smocks-magellan-nightwatch.magellan` lifecycle callback options

* ***distPath***: an output path that can be used that will be cleaned up automatically
* ***log***: a log function to add log entries to the `logFile` if desired.


### Nightwatch init attributes and options
#### `smocks-magellan-nightwatch.nightwatch` attributes

* ***mockServer***: (optional) Smocks plugin to allow managed start/stop of the mock server.
* ***mockServer.start(options, callback)***: (optional) instead of a managed mock server a manual startup process can be used
* ***mockServer.stop(options, callback)***: (optional) if manual startup process is used, this should be implemented to stop the mock server
* ***appServer.start(options, callback)***: (optional) instead of a managed server which serves files out of the `distPath` a manual startup process can be used
* ***appServer.stop(options, callback)***: (optional) if manual startup process is used, this should be implemented to stop the app server
* ***onStart(options)***: Called after mock server and app server have been started (or at least the callbacks have been made)
* ***logFile***: (optional) a log file for debugging purposes (because logging is difficult when running in parallel)

#### `smocks-magellan-nightwatch.magellan` lifecycle callback options

* ***distPath***: an output path that can be used that will be cleaned up automatically
* ***log***: a log function to add log entries to the `logFile` if desired.
* ***mocksPort***: a free port that can be used for your mock Server
* ***appPort***: a free port that can be used for your app Server

### Additional Install Details (easy or manual way)
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

#### resetMockConfig
Reset all fixture config (which can be updated using the `setMockVariant` command)
*no parameters required*
```
  browser.resetMockConfig();
```

#### resetMockState
Reset the state of the mock server
*no parameters required*
```
  browser.resetMockState();
```

#### setMockVariant
signature: `({fixtureId, variantId})`
Set a fixture to have a specific variant.  The fixture id and variant id can be seen (if looking at the "Paths" view).
```
  browser.setMockVariant({ fixture: "fixture id", variant: "variant id" });
```

#### setRouteInput
signature: `({fixtureId, input})`
Set input values for a fixture (see "Configuration" section).
```
  browser.setRouteInput({ fixture: "fixture id", input: {inputKey1, "value", inputKey2: "value"}});
```

#### setVariantInput
signature: `({fixtureId, input})`
Set input values for the selected variant of a fixture (see "Configuration" section).
```
  browser.setVariantInput({ fixture: "fixture id", input: {inputKey1, "value", inputKey2: "value"}});
```
