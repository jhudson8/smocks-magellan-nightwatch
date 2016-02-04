3.0.2
- support deep linking of container page (for pushState) with simple/automated setup

3.0.1
Major structural changes (added ability to manually control the app server and mock server startup and teardown).  See [README.md](README.md) for details. This is *mostly* backwards compatible except you must change
```
// magellan init
module.exports = require('smocks-magellan-nightwatch/setup-teardown')({
  build: ...
  ...
});
```
to
```
module.exports = require('smocks-magellan-nightwatch').magellan({
  before: ...
  ...
});
```
see [README.md](README.md) for more lifecycle events.

and
```
// nightwatch init
module.exports = require('smocks-magellan-nightwatch').init({
  ...
});
```
to
```
module.exports = require('smocks-magellan-nightwatch').nightwatch({
  ...
});
```

3.0.0
Don't use this yet until 3.0.1 - might not be stable

Changes to be documented later but include additional hooks for manually building applications

v2.1.0
Add additional route/variant input mutation commands: see [smocks-nightwatch-commands](https://github.com/jhudson8/smocks-magellan-nightwatch#smocks-nightwatch-commands)

v2.0.0
refactor to use consistent structure for both nightwatch and magellan

to adjust your code, see below

before
```
// magellan global setup/teardown script
module.exports = require('smocks-magellan-nightwatch/setup-teardown')({
...

// nightwatch global setup/teardown script
module.exports = require('smocks-magellan-nightwatch').init({
...
```

after
```
// magellan global setup/teardown script
module.exports = require('smocks-magellan-nightwatch').magellan({
...

// nightwatch global setup/teardown script
module.exports = require('smocks-magellan-nightwatch').nightwatch({
...
```

v1.0.1
refactoring to clean things up (no bug fixes... nothing changed)

v1.0.0
update to use latest magellan (which now allows global setup/teardown)

See the readme file for changes but essentially you now need an additional (small) magellan init file which allows the application to be build outside of the nightwatch worker process so it can be shared

v0.0.2
  no code changes... added github repo t package

v0.0.1

  Initial release
