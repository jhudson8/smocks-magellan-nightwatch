Smocks mock server impl
=======================

The [endpoints.js](./endpoints.js) file contains the actual implementation of the mock fixtures.

There are 2 different ways that a [smocks](https://github.com/jhudson8/smocks) server can be started

* directly using the [smocks API](http://jhudson8.github.io/fancydocs/index.html#project/jhudson8/smocks/section/Starting%2520the%2520server): (see [run-mock-server.js](./run-mock-server.js))
* as a HAPI plugin for your own HAPI server: (see [mock-server-hapi-plugin.js](./mock-server-hapi-plugin.js))

If you want to start the mock server from the terminal (in `example` directory) you can use
```
node mocks/run-mock-server.js
```
