This is a *very simple* application just to demonstrate a dev env with the smocks mock server and end to end tests which control mock server responses.

The app just makes an XHR request to retrieve a message to be displayed on the screen.localhost:8000/_admin).

Running the app
---------------
```
npm install
npm start
```
then browse to [http://localhost:8080](http://localhost:8080)

or use the ***mock admin panel*** at [localhost:8000/_admin](http://localhost:8000/_admin) to change the messages displayed in the app


Running the Magellan Nightwatch tests
-------------------------------------
```
npm test
```
The tests are in [./tests/message-tests](./tests/message-tests)

The mock service is in [./mocks](./mocks)
