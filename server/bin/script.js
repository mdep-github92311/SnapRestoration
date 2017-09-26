/**
 * Created by msgis-student on 5/31/2017.
 */
// https://stackoverflow.com/questions/26128285/loopback-discoverandbuildmodels-not-generating-models
  // script for discovering and writing JSON model based on DB schema was derived from the link above
var path = require('path');
var fs = require('fs');
var app = require(path.resolve(__dirname, '../server'));
var outputPath = path.resolve(__dirname, '../../common/models');

var dataSource = app.dataSources.mip;

function schemaCB(err, schema) {
  if(schema) {
    console.log("Auto discovery success: " + schema.name);
    var outputName = outputPath + '/' +schema.name + '.json';
    fs.writeFile(outputName, JSON.stringify(schema, null, 2), function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("JSON saved to " + outputName);
      }
    });
  }
  if(err) {
    console.error(err);
    return;
  }
  return;
};
/*--------------------Barrier----------------------------------------*/
dataSource.discoverSchema("barrier",{schema:'public'},schemaCB);
/*--------------------Disturbance----------------------------------------*/
dataSource.discoverSchema("dist_point",{schema:'public'},schemaCB);
dataSource.discoverSchema("dist_line",{schema:'public'},schemaCB);
dataSource.discoverSchema("dist_polygon",{schema:'public'},schemaCB);
/*--------------------Restoration----------------------------------------*/
dataSource.discoverSchema("resto_point",{schema:'public'},schemaCB);
dataSource.discoverSchema("resto_line",{schema:'public'},schemaCB);
dataSource.discoverSchema("resto_polygon",{schema:'public'},schemaCB);
/*--------------------Barrier Submissions--------------------------------------*/
dataSource.discoverSchema("barrier_sub",{schema:'public'},schemaCB);
/*--------------------Disturbance Submissions----------------------------------*/
dataSource.discoverSchema("dist_line_sub",{schema:'public'},schemaCB);
dataSource.discoverSchema("dist_point_sub",{schema:'public'},schemaCB);
dataSource.discoverSchema("dist_polygon_sub",{schema:'public'},schemaCB);
/*--------------------Restoration Submissions---------------------------------*/
dataSource.discoverSchema("resto_point_sub",{schema:'public'},schemaCB);
dataSource.discoverSchema("resto_line_sub",{schema:'public'},schemaCB);
dataSource.discoverSchema("resto_polygon_sub",{schema:'public'},schemaCB);
/*--------------------Disturbance / Restoration Centroids--------------------*/
dataSource.discoverSchema("dist_poly_centroid",{schema:'public'},schemaCB);
dataSource.discoverSchema("rest_poly_centroid",{schema:'public'},schemaCB);
/*--------------------Regions----------------------------------------*/
dataSource.discoverSchema("blm_regions",{schema:'public'},schemaCB);
dataSource.discoverSchema("fs_regions",{schema:'public'},schemaCB);
/*--------------------Boundaries----------------------------------------*/
dataSource.discoverSchema("mdep_boundary",{schema:'public'},schemaCB);
dataSource.discoverSchema("mdi_boundary",{schema:'public'},schemaCB);
/*--------------------Counties----------------------------------------*/
dataSource.discoverSchema("nv_counties",{schema:'public'},schemaCB);
/*--------------------Roads----------------------------------------*/
dataSource.discoverSchema("roads",{schema:'public'},schemaCB);
/*--------------------Misc----------------------------------------*/
dataSource.discoverSchema("snap_extent",{schema:'public'},schemaCB);
dataSource.discoverSchema("soil_vulnerability",{schema:'public'},schemaCB);





