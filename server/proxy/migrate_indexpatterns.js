import createClient from './create_client';

module.exports = function (server, index, ignore) {
  server.log(['plugin:own-home', 'debug'], 'migrate_indexpatterns');
  const config = server.config();
  const client = createClient(server);

  const params =  {
    body: {
      source: {
        index: config.get('kibana.index'),
        type: 'doc',
        query: {
          match: {
            type: 'index-pattern',
          }
        }
      },

      dest: {
        index: index
      }
    }
  };

  server.log(['plugin:own-home', 'debug'], 'migrate_indexpatterns', 'params', params);
  return client.reindex(params);
};
