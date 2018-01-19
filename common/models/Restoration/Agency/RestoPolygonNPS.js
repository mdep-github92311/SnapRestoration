// https://stackoverflow.com/questions/26999327/execute-raw-query-on-mysql-loopback-connector
// https://stackoverflow.com/questions/28868617/how-can-i-create-a-loopback-remote-method-with-a-model-schema?rq=1
// both links above were used  so i can make a custom REST API based on my native SQL Query

module.exports = function (RestoPolygonNPS) {
  const testQuery = require("../../../javascripts/query.js");

  RestoPolygonNPS.restoPolyNPSGeoJSON = function (query, cb) {
    const dataSource = RestoPolygonNPS.app.datasources.mip;
    const sql = testQuery.resto_poly_nps_query;

    dataSource.connector.query(sql, query, function (err, barrierQ) {
      if (err) return cb(err);
      cb(err, barrierQ);
    });
  };

  RestoPolygonNPS.remoteMethod(
    'restoPolyNPSGeoJSON',
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
        type: ['RestoPolygonNPS'],
        root: true
      }
    }
  );
};
