// https://stackoverflow.com/questions/26999327/execute-raw-query-on-mysql-loopback-connector
// https://stackoverflow.com/questions/28868617/how-can-i-create-a-loopback-remote-method-with-a-model-schema?rq=1
// both links above were used  so i can make a custom REST API based on my native SQL Query

module.exports = function (RestoPolygonFS) {
  const testQuery = require("../../../javascripts/query.js");

  RestoPolygonFS.restoPolyFSGeoJSON = function (query, cb) {
    const dataSource = RestoPolygonFS.app.datasources.mip;
    const sql = testQuery.resto_poly_fs_query;

    dataSource.connector.query(sql, query, function (err, barrierQ) {
      if (err) return cb(err);
      cb(err, barrierQ);
    });
  };

  RestoPolygonFS.remoteMethod(
    'restoPolyFSGeoJSON',
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
        type: ['RestoPolygonFS'],
        root: true
      }
    }
  );
};
