These are custom nightwatch commands for smocks server integration.

This path must be registered in the nightwatch.json file in `custom_commands_path`.

The commands available are used for controlling the mock server.

* resetMockConfig: Reset all fixture config (which can be updated using the `setMockVariant` command)
* resetMockState: Reset the state of the mock server
* setMockVariant: Set a fixture to have a specific variant.  The fixture id and variant id can be seen (if looking at the "Paths" view)... Usage: client.setMockVariant({ fixture: `fixture id`, variant: `variant id` })