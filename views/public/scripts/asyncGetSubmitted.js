"use strict";

async function getSubmissions(type) {
  var barriers, distPoints, distPolys, distLines, restoLines, restoPoints, restoPolys;
  barriers = distPoints = distPolys = distLines = restoLines = restoPoints = restoPolys = [];
  var overallCount = 0;
  try {
    if (type != 'AllSubs')
      switch (type) {
        case 'barriers':
          await $.getJSON('../../api/BarrierSubs/barrierSubGeoJSON', function(data) {
            barriers = data[0].row_to_json;
            if (barriers.features != null)
              overallCount += barriers.features.length;
          });
          break;
        case 'distPoints':
          await $.getJSON('../../api/DistPointSubs/distPointSubGeoJSON', function(data) {
            distPoints = data[0].row_to_json;
            if (distPoints.features != null)
              overallCount += distPoints.features.length;
          });
          break;
        case 'distLines':
          await $.getJSON('../../api/DistLineSubs/distLineSubGeoJSON', function(data) {
            distLines = data[0].row_to_json;
            if (distLines.features != null)
              overallCount += distLines.features.length;
          });
          break;
        case 'distPolys':
          await $.getJSON('../../api/DistPolygonSubs/distPolySubGeoJSON', function(data) {
            distPolys = data[0].row_to_json;
            if (distPolys.features != null)
              overallCount += distPolys.features.length;
          });
          break;
        case 'restoPoints':
          await $.getJSON('../../api/RestoPointSubs/restoPointSubGeoJSON', function(data) {
            restoPoints = data[0].row_to_json;
            if (restoPoints.features != null)
              overallCount += restoPoints.features.length;
          });
          break;
        case 'restoLines':
          await $.getJSON('../../api/RestoLineSubs/restoLineSubGeoJSON', function(data) {
            restoLines = data[0].row_to_json;
            if (restoLines.features != null)
              overallCount += restoLines.features.length;
          });
          break;
        case 'restoPolys':
          await $.getJSON('../../api/RestoPolygonSubs/restoPolySubGeoJSON', function(data) {
            restoPolys = data[0].row_to_json;
            if (restoPolys.features != null)
              overallCount += restoPolys.features.length;
          });
          break;

      }
    else {
      $.when(
        await $.getJSON('../../api/BarrierSubs/barrierSubGeoJSON', function(data) {
          barriers = data[0].row_to_json;
          if (barriers.features != null)
            overallCount += barriers.features.length;
        }),

        await $.getJSON('../../api/DistPointSubs/distPointSubGeoJSON', function(data) {
          distPoints = data[0].row_to_json;
          if (distPoints.features != null)
            overallCount += distPoints.features.length;
        }),

        await $.getJSON('../../api/DistLineSubs/distLineSubGeoJSON', function(data) {
          distLines = data[0].row_to_json;
          if (distLines.features != null)
            overallCount += distLines.features.length;

        }),

        await $.getJSON('../../api/DistPolygonSubs/distPolySubGeoJSON', function(data) {
          distPolys = data[0].row_to_json;
          if (distPolys.features != null)
            overallCount += distPolys.features.length;
        }),

        /*//$.getJSON('../../api/DistPolyCentroids/distPolyCentGeoJSON', function (data) {
          // some code
        }),*/

        await $.getJSON('../../api/RestoPointSubs/restoPointSubGeoJSON', function(data) {
          //console.log(data);
          restoPoints = data[0].row_to_json;
          if (restoPoints.features != null)
            overallCount += restoPoints.features.length;
        }),

        await $.getJSON('../../api/RestoLineSubs/restoLineSubGeoJSON', function(data) {
          restoLines = data[0].row_to_json;
          if (restoLines.features != null)
            overallCount += restoLines.features.length;
        }),

        await $.getJSON('../../api/RestoPolygonSubs/restoPolySubGeoJSON', function(data) {
          restoPolys = data[0].row_to_json;
          if (restoPolys.features != null)
            overallCount += restoPolys.features.length;
        })
      );
    }

    var subs = {
      barriers,
      distPoints,
      distPolys,
      distLines,
      restoLines,
      restoPoints,
      restoPolys,
      overallCount
    };

    return subs;
  }

  catch (err) {
    console.error(err);
  }
};
