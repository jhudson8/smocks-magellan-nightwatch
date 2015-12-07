Example Web Application
=======================

This is a *very simple* web application that just makes an XHR request to retrieve a message to be displayed on the screen.  This message can be controlled by selecting different variants in the [mock server admin panel](http://localhost:8000/_admin).

The application is build with [webpack](https://webpack.github.io/).

* ***[index.js](./index.js)*** is the main application code
* ***[config.js](./config.js)*** is a module used by [index.js](./index.js) to abstract the external URL reference base paths (so the mock server can be used when appropriate).


How it works
------------
The example app can be run with (if in the `example` directory)
```
npm start
```
which actually runs the command
```
webpack-dev-server --config webpack.config.dev.js
```
which runs the [webpack dev server](https://webpack.github.io/docs/webpack-dev-server.html) with a [dev-specific config file](../webpack.config.dev.js) which is used to inject the `configMode = "mocks"` global variable so we can run against the mock server when doing normal development.  The mock server can proxy to external APIs so you can perform all development using the mock server.

When building the app for production, you would simply refer to the [standard webpack config](../webpack.config.js).