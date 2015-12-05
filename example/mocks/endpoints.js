var smocks = require('smocks');

smocks.id('example');

smocks.route({
    id: 'world',
    label: 'hello message',
    path: '/message',

    variantLabel: 'hello world',
    handler: function(req, reply) {
      reply({message: 'hello world'});
    }
  })

  .variant({
    id: 'universe',
    label: 'hello universe',
    handler: function (req, reply) {
      reply({message: 'hello universe'});
    }
  });
