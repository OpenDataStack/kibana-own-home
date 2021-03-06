import migrateConfig from './migrate_config';
import migrateIndexPatterns from './migrate_indexpatterns';

module.exports = function (server, index) {
  server.log(['plugin:own-home', 'debug'], 'create_kibana_index');
  const { callWithInternalUser } = server.plugins.elasticsearch.getCluster('admin');
  return callWithInternalUser('indices.create', {
    index: index,
    waitForActiveShards: 1,
    body: {
      settings: {
        number_of_shards: 1
      },
      mappings: server.getKibanaIndexMappingsDsl()
    }
  })
    .catch(() => {
      throw new Error(`Unable to create Kibana index "${index}"`);
    })
    .then(function () {
      return callWithInternalUser('cluster.health', {
        waitForStatus: 'yellow',
        index: index
      })
        .catch(() => {
          throw new Error(`Waiting for Kibana index "${index}" to come online failed.`);
        })
        .then(migrateConfig(server, index, [409]))
        .then(function () {
          migrateIndexPatterns(server, index, [409])
            .catch(() => { throw new Error(`Migrating Index Patterns to "${index}" failed.`);});
        });
    });
};
