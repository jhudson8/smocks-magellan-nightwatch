Example nightwatch tests
=============

The actual nightwatch tests are in [./message-tests](./message-tests) which extend a [base test class](./base.js) which is really only used to [provide application urls](https://github.com/jhudson8/smocks-magellan-nightwatch/blob/master/example/tests/base.js#L30) (because each nightwatch worker has their own app instance running on a separate port).

The `setup_teardown` script reference in magellan.json points to [./magellan-init.js] which allows you to copy your app to where nightwatch will be serving it out.

Most of the [nightwatch.json](./nightwatch.json) is boilerplate except the following
```
  "src_folders": ["./tests/message-tests"],
  "custom_commands_path": [
    "./node_modules/testarmada-magellan-nightwatch/lib/commands",
    "./node_modules/smocks-magellan-nightwatch/commands"
  ],
  "globals_path": "./tests/nightwatch-init.js",
```

***src_folders*** points to the folders where the nightwatch tests live.

***custom_commands_path*** include the magellan-nightwatch commands along with the mock server interaction commands.

***globals_path*** is a reference to [./init.js](./init.js) so we can hook into the nightwatch worker global setup/teardown.
