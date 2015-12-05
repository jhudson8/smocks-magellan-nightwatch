This is a *very simple* application just to demonstrate a dev env with the smocks mock server and end to end tests which control mock server responses.

Running the app
---------------
```
npm install
npm start
```
browse to [http://localhost:8080](http://localhost:8080)

view the [mock admin panel](http://localhost:8000/_admin) to change the messages (then refresh the page)


Running the Magellan Nightwatch tests
-------------------------------------
```
npm test
```
The tests are in [./tests/message-tests](./tests/message-tests)

The mock server impl is [./mocks/endpoints.js](./mocks/endpoints.js)