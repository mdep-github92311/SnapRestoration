"use strict";

async function getData(type, geoJSONstring) {
  var barriers, distPoints, distPolys, distLines, restoLines, restoPoints, restoPolys;
  barriers = distPoints = distPolys = distLines = restoLines = restoPoints = restoPolys = [];
  var ipAddress = "216.117.167.186:443";
  ipAddress = "snap-restoration-brstillwell.c9users.io";
  var overallCount = 0;
try {
    $.when(
      
      await $.getJSON('../../api/'+type+'/'+geoJSONstring, function (data) {
        switch (type) {
          case 'Barriers':
            barriers = data[0].row_to_json;
            if (barriers.features != null)
              overallCount += barriers.features.length;
            break;
          case 'DistPoints':
            distPoints = data[0].row_to_json;
            if (distPoints.features != null)
              overallCount += distPoints.features.length;
            break;
          case 'DistLines':
            distLines = data[0].row_to_json;
            if (distLines.features != null)
              overallCount += distLines.features.length;
            break;
          case 'DistPolygons':
            distPolys = data[0].row_to_json;
            if (distPolys.features != null)
              overallCount += distPolys.features.length;
            break;
          case 'RestoPoints':
            restoPoints = data[0].row_to_json;
            if (restoPoints.features != null)
              overallCount += restoPoints.features.length;
            break;
          case 'RestoLines':
            restoLines = data[0].row_to_json;
            if (restoLines.features != null)
              overallCount += restoLines.features.length;
            break;
          case 'RestoPolygons':
            restoPolys = data[0].row_to_json;
            if (restoPolys.features != null)
              overallCount += restoPolys.features.length;
            break;
          
        }
      })
      
      // await $.getJSON('http://' + ipAddress + '/api/Barriers/barrierGeoJSON', function (data) {
      //   barriers = data[0].row_to_json;
      //   if (barriers.features != null)
      //     overallCount += barriers.features.length;
      // }),
        
      // await $.getJSON('http://' + ipAddress + '/api/DistPoints/distPointGeoJSON', function (data) {
      //   distPoints = data[0].row_to_json;
      //   if (distPoints.features != null)
      //     overallCount += distPoints.features.length;
      // }),
    
      // await $.getJSON('http://' + ipAddress + '/api/DistLines/distLineGeoJSON', function (data) {
      //   distLines = data[0].row_to_json;
      //   if (distLines.features != null)
      //     overallCount += distLines.features.length;
        
      // }),
    
      // await $.getJSON('http://' + ipAddress + '/api/DistPolygons/distPolyGeoJSON', function (data) {
      //   distPolys = data[0].row_to_json;
      //   if (distPolys.features != null)
      //     overallCount += distPolys.features.length;
      // }),
    
      // /*//$.getJSON('http://' + ipAddress + '/api/DistPolyCentroids/distPolyCentGeoJSON', function (data) {
      //   // some code
      // }),*/
    
      // await $.getJSON('http://' + ipAddress + '/api/RestoPoints/restoPointGeoJSON', function (data) {
      //   //console.log(data);
      //   restoPoints = data[0].row_to_json;
      //   if (restoPoints.features != null)
      //     overallCount += restoPoints.features.length;
      // }),
    
      // await $.getJSON('http://' + ipAddress + '/api/RestoLines/restoLineGeoJSON', function (data) {
      //   restoLines = data[0].row_to_json;
      //   if (restoLines.features != null)
      //     overallCount += restoLines.features.length;
      // }),
    
      // await $.getJSON('http://' + ipAddress + '/api/RestoPolygons/restoPolyGeoJSON', function (data) {
      //   restoPolys = data[0].row_to_json;
      //   if (restoPolys.features != null)
      //     overallCount += restoPolys.features.length;
      // })
    );

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
    
    /*console.log(
      barriers, 
      distPoints, 
      distPolys, 
      distLines, 
      restoLines, 
      restoPoints, 
      restoPolys);*/
      
    }
      
  catch (err) {
      console.error(err);
  }
};
