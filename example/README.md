This is a *very simple* application just to demonstrate a dev env with the smocks mock server and end to end tests which control mock server responses.

The app just makes an XHR request to retrieve a message to be displayed on the screen.  This message can be controlled by selecting different variants in the [mock server admin panel](http://localhost:8000/_admin).

Running the app
---------------
```
npm install
npm start
```
browse to [http://localhost:8080](http://localhost:8080)

view the [mock admin panel](http://localhost:8000/_admin) to change the messages


Running the Magellan Nightwatch tests
-------------------------------------
```
npm test
```
The tests are in [./tests/message-tests](./tests/message-tests)

The mock server impl is [./mocks/endpoints.js](./mocks/endpoints.js)
