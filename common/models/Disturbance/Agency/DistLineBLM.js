// https://stackoverflow.com/questions/26999327/execute-raw-query-on-mysql-loopback-connector
// https://stackoverflow.com/questions/28868617/how-can-i-create-a-loopback-remote-method-with-a-model-schema?rq=1
// both links above were used  so i can make a custom REST API based on my native SQL Query

module.exports = function (DistLineBLM) {
  const testQuery = require("../../../javascripts/query.js");

  DistLineBLM.distLineBLMGeoJSON = function (query, cb) {
    const dataSource = DistLineBLM.app.datasources.mip;
    const sql = testQuery.dist_line_blm_query;

    dataSource.connector.query(sql, query, function (err, barrierQ) {
      if (err) return cb(err);
      cb(err, barrierQ);
    });
  };

  DistLineBLM.remoteMethod(
    'distLineBLMGeoJSON',
    {
      http: {verb: 'get'},
      description: 'This will query Postgres and return a GeoJSON for Leaflet',
      accepts: {
        arg: 'filter',
        type: 'array',
        http: {
          source: 'query'
        }
      },
      returns: {
        arg:'data',
        type: ['DistLineBLM'],
        root: true
      }
    }
  );
};
