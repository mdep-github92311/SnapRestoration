"use strict";

async function getData(type, geoJSONstring) {
  var barriers, distPoints, distPolys, distLines, restoLines, restoPoints, restoPolys;
  barriers = distPoints = distPolys = distLines = restoLines = restoPoints = restoPolys = [];
  var overallCount = 0;
  try {
      switch (type) {
        case 'barriers':
          await $.getJSON('../../api/Barriers/barrierGeoJSON', function(data) {
            barriers = data[0].row_to_json;
            if (barriers.features != null)
              overallCount += barriers.features.length;
          });
          break;
        case 'distPoints':
          await $.getJSON('../../api/DistPoints/distPointGeoJSON', function(data) {
            distPoints = data[0].row_to_json;
            if (distPoints.features != null)
              overallCount += distPoints.features.length;
          });
          break;
        case 'distLines':
          await $.getJSON('../../api/DistLines/distLineGeoJSON', function(data) {
            distLines = data[0].row_to_json;
            if (distLines.features != null)
              overallCount += distLines.features.length;
          });
          break;
        case 'distPolys':
          await $.getJSON('../../api/DistPolygons/distPolyGeoJSON', function(data) {
            distPolys = data[0].row_to_json;
            if (distPolys.features != null)
              overallCount += distPolys.features.length;
          });
          break;
        case 'restoPoints':
          await $.getJSON('../../api/RestoPoints/restoPointGeoJSON', function(data) {
            restoPoints = data[0].row_to_json;
            if (restoPoints.features != null)
              overallCount += restoPoints.features.length;
          });
          break;
        case 'restoLines':
          await $.getJSON('../../api/RestoLines/restoLineGeoJSON', function(data) {
            restoLines = data[0].row_to_json;
            if (restoLines.features != null)
              overallCount += restoLines.features.length;
          });
          break;
        case 'restoPolys':
          await $.getJSON('../../api/RestoPolygons/restoPolyGeoJSON', function(data) {
            restoPolys = data[0].row_to_json;
            if (restoPolys.features != null)
              overallCount += restoPolys.features.length;
          });
          break;

      }

    var data = {
      barriers,
      distPoints,
      distPolys,
      distLines,
      restoLines,
      restoPoints,
      restoPolys,
      overallCount
    };

    return data;
  }

  catch (err) {
    console.error(err);
  }
};
