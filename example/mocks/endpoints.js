var smocks = require('smocks');

smocks.id('example');

smocks.route({
    id: 'message',
    path: '/message',
    handler: function(req, reply) {
      reply({message: 'hello world'});
    }
  })

  .variant({
    id: 'universe',
    handler: function (req, reply) {
      reply({message: 'hello universe'});
    }
  });
