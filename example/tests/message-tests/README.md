Nightwatch Tests
================

These nightwatch tests ensure that the application displays the message that it retrieves from an XHR request to the mock server.

The mock server fixture supports multiple variants (so different messages can be returned).

[hello-world.js](./hello-world.js) tests the default version of the mock service

[hello-universe.js](./hello-universe.js) tests a specific variant of the mock fixture which returns an alternative message.  This uses a [custom smocks nightwatch command](https://github.com/jhudson8/smocks-magellan-nightwatch#smocks-nightwatch-commands) ("setMockVariant") to control the mock server and alter the fixture to return the `hello universe` variant.