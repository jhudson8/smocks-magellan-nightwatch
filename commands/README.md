Smocks Nightwatch Commands
--------------------------
By adding the following entry as a custom command path in your [nightwatch.json](http://nightwatchjs.org/guide#settings-file), you can control the smocks server in your end to end tests
```
  "custom_commands_path": [
    ...
    "./node_modules/smocks-magellan-nightwatch/commands"
  ],
```

The commands available are used for controlling the mock server.

#### executeAction
Execute a specified action defined on a route
signature: `({route: "route id", variant: "variant id", input: {action input}})`
```
  browser.executeAction({
    route: 'routeId',
    action: 'actionId',
    input: {
      foo: 'bar'
    }
  });
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
signature: `({route: "route id", variant: "variant id"})`
Set a fixture to have a specific variant.  The fixture id and variant id can be seen (if looking at the "Paths" view).
```
  browser.setMockVariant({
    route: "routeId",
    variant: "variantId"
  });
```

#### setRouteInput
signature: `({route: "route id", input: {route input}})`
Set input values for a fixture (see "Configuration" section).
```
  browser.setRouteInput({
    route: "routeId",
    input: { inputKey1, "value", inputKey2: "value" }
  });
```

#### setVariantInput
signature: `({route: "route id", input: {variant input}})`
Set input values for the selected variant of a fixture (see "Configuration" section).
```
  browser.setVariantInput({
    route: "routeId",
    input: { inputKey1, "value", inputKey2: "value" }
  });
```
